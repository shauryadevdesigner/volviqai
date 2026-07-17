import { createOpenAI } from "@ai-sdk/openai";
import {
  generateObject as sdkGenerateObject,
  generateText as sdkGenerateText,
  streamText as sdkStreamText,
  GenerateObjectResult,
  StreamTextResult,
} from "ai";
import { AIProvider } from "./provider-interface";
import { AI_CONFIG } from "./config";
import { logger } from "../lib/logger";

// ── Configuration Defaults ──────────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const MAX_TOKENS_CAP = 16000;

// ── Clean JSON Content Helper ───────────────────────────────────────────────

/**
 * Removes reasoning <think> blocks and extracts JSON blocks if present.
 * Prevents JSON parsing errors when models output explanation wrapper text.
 */
function cleanContent(text: string): string {
  let cleaned = text.trim();

  // 1. Remove <think>...</think> blocks (typical for reasoning models)
  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }

  // 2. Try to extract from ```json ... ``` block
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // 3. Try brace-matching starting from the last '}' to find the outer JSON object
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1) {
    let braceCount = 0;
    for (let i = lastBrace; i >= 0; i--) {
      if (cleaned[i] === "}") {
        braceCount++;
      } else if (cleaned[i] === "{") {
        braceCount--;
        if (braceCount === 0) {
          const candidate = cleaned.substring(i, lastBrace + 1);
          try {
            JSON.parse(candidate);
            return candidate;
          } catch {
            // Not valid JSON, continue searching backwards
          }
        }
      }
    }
  }

  // 4. Try bracket-matching starting from the last ']' to find outer JSON array
  const lastBracket = cleaned.lastIndexOf("]");
  if (lastBracket !== -1) {
    let bracketCount = 0;
    for (let i = lastBracket; i >= 0; i--) {
      if (cleaned[i] === "]") {
        bracketCount++;
      } else if (cleaned[i] === "[") {
        bracketCount--;
        if (bracketCount === 0) {
          const candidate = cleaned.substring(i, lastBracket + 1);
          try {
            JSON.parse(candidate);
            return candidate;
          } catch {
            // Not valid JSON, continue searching backwards
          }
        }
      }
    }
  }

  // 5. Fallback to first '{' and last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBraceFallback = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBraceFallback !== -1 && lastBraceFallback > firstBrace) {
    return cleaned.substring(firstBrace, lastBraceFallback + 1);
  }

  const firstBracket = cleaned.indexOf("[");
  const lastBracketFallback = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracketFallback !== -1 && lastBracketFallback > firstBracket) {
    return cleaned.substring(firstBracket, lastBracketFallback + 1);
  }

  return cleaned;
}

// ── Custom Fetch with Retry / Timeout / Error Handling ──────────────────────

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input.toString();
  const start = Date.now();

  const headers = new Headers(init?.headers);

  // Intercept request body to cap token limits and detect model name
  let body = init?.body;
  let modelName = "";
  if (body && typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed.model) {
        modelName = parsed.model;
      }
      if (!parsed.max_tokens || parsed.max_tokens > MAX_TOKENS_CAP) {
        parsed.max_tokens = MAX_TOKENS_CAP;
      }
      if (!parsed.max_output_tokens || parsed.max_output_tokens > MAX_TOKENS_CAP) {
        parsed.max_output_tokens = MAX_TOKENS_CAP;
      }
      body = JSON.stringify(parsed);
    } catch {
      // Not JSON body
    }
  }

  // Resolve timeout dynamically based on model config
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  if (modelName) {
    const config = AI_CONFIG.models[modelName];
    if (config?.timeoutMs) {
      timeoutMs = config.timeoutMs;
    }
  }

  let attempt = 0;
  const maxRetries = DEFAULT_MAX_RETRIES;
  let delay = 2000;

  while (attempt < maxRetries) {
    const attemptController = new AbortController();
    const attemptTimeoutId = setTimeout(() => attemptController.abort(), timeoutMs);
    const attemptStart = Date.now();

    const requestInit: RequestInit = {
      ...init,
      body,
      headers,
      signal: attemptController.signal,
    };

    try {
      attempt++;
      logger.info(`OpenRouter call initiated (Attempt ${attempt}/${maxRetries})`);
      
      const response = await fetch(input, requestInit);
      clearTimeout(attemptTimeoutId);

      const duration = Date.now() - start;

      if (!response.ok) {
        let errorData: any = {};
        try {
          const responseClone = response.clone();
          errorData = await responseClone.json();
        } catch {
          try {
            errorData = { error: await response.text() };
          } catch {
            errorData = { error: "Unknown request failure" };
          }
        }

        logger.error(`OpenRouter API error on ${url} (attempt ${attempt}): Status ${response.status}`, errorData);

        const errorMsg = errorData.error?.message || errorData.message || "";
        const errorType = errorData.error?.type || errorData.type || "";
        const combinedErrorStr = `${errorMsg} ${errorType}`.toLowerCase();

        const isDailyLimit = combinedErrorStr.includes("daily_limit") || 
                             combinedErrorStr.includes("daily limit") ||
                             combinedErrorStr.includes("quota exceeded");
                             
        const isModelNotAvailable = response.status === 404 && (
          combinedErrorStr.includes("model") ||
          combinedErrorStr.includes("not found") ||
          combinedErrorStr.includes("not available")
        );

        // Fail-fast on client errors (400, 401, 403, 404) unless it's a transient 429
        const isTransient = (response.status === 429 || response.status >= 500);
        const shouldRetry = isTransient && !isDailyLimit && !isModelNotAvailable && attempt < maxRetries;

        if (!shouldRetry) {
          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            message: errorData.error?.message || errorData.message || "Unknown OpenRouter API error",
            type: errorData.error?.type || "openrouter_api_error",
          }));
        }

        // Apply backoff/cooldown for rate limits or transient errors
        let cooldownMs = delay;
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          if (retryAfter) {
            cooldownMs = parseInt(retryAfter, 10) * 1000 || delay;
          } else {
            cooldownMs = 60000; // default 1m wait for rate limit
          }
          logger.warn(`Rate limit (429) hit on OpenRouter request. Cooldown applied: ${cooldownMs}ms.`);
        } else {
          logger.warn(`Retrying OpenRouter request in ${delay}ms due to status ${response.status}...`);
        }

        await new Promise((resolve) => setTimeout(resolve, cooldownMs));
        delay = cooldownMs * 2;
        continue;
      }

      logger.info(`OpenRouter response received in ${duration}ms (Success: true)`);
      
      // Clean JSON response content for non-streaming calls
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const responseClone = response.clone();
          const data = await responseClone.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const originalContent = data.choices[0].message.content;
            if (originalContent) {
              const cleanedContent = cleanContent(originalContent);
              data.choices[0].message.content = cleanedContent;
              
              const cleanedHeaders = new Headers(response.headers);
              cleanedHeaders.delete("content-length");
              cleanedHeaders.delete("content-encoding");
              cleanedHeaders.delete("transfer-encoding");

              return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: cleanedHeaders,
              });
            }
          }
        } catch (err) {
          logger.warn("Failed to clean customFetch JSON response:", err);
        }
      }

      return response;
    } catch (error: any) {
      clearTimeout(attemptTimeoutId);
      const attemptDuration = Date.now() - attemptStart;

      const errorMessage = error.message || "";
      const isAbortOrTimeout = 
        error.name === "AbortError" || 
        errorMessage.includes("aborted") || 
        errorMessage.includes("timeout") ||
        errorMessage.includes("Timeout");

      if (isAbortOrTimeout) {
        logger.error(`OpenRouter API timeout or abort on ${url} after ${attemptDuration}ms (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        if (attempt < maxRetries) {
          logger.warn(`Retrying after timeout/abort in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw new Error(JSON.stringify({
          status: 408,
          statusText: "Timeout",
          message: `Request to OpenRouter timed out or was aborted: ${errorMessage}`,
          type: "timeout_error",
        }));
      }

      let isStructuredError = false;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.status) {
          isStructuredError = true;
        }
      } catch {
        // Not a JSON-stringified error
      }
      if (isStructuredError) {
        throw error;
      }

      if (attempt >= maxRetries) {
        logger.error(`OpenRouter call failed after maximum retries. Error: ${error.message}`);
        throw new Error(JSON.stringify({
          status: 503,
          statusText: "Service Unavailable",
          message: error.message || "Network connection failed",
          type: "network_error",
        }));
      }

      logger.warn(`OpenRouter network error (attempt ${attempt}): ${error.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error(JSON.stringify({
    status: 503,
    statusText: "Service Unavailable",
    message: "Failed to connect to OpenRouter after maximum retry attempts.",
    type: "network_error",
  }));
};

// ── OpenRouter Provider Implementation ──────────────────────────────────────

export class OpenRouterProvider implements AIProvider {
  readonly name = "openrouter";
  private client: any;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    this.client = createOpenAI({
      baseURL: process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL,
      apiKey: apiKey || "",
      headers: {
        "HTTP-Referer": "https://volviq.ai",
        "X-Title": "Volviq AI",
      },
      fetch: customFetch,
    });
  }

  private getModel(modelName: string) {
    const config = AI_CONFIG.models[modelName];
    // Fall back defensively to default model if the internal key is not in config
    const targetModelId = config?.id || AI_CONFIG.models[AI_CONFIG.defaultModel]?.id || "meta-llama/llama-3.3-70b-instruct:free";
    logger.info(`Resolved model "${modelName}" → "${targetModelId}"`);
    return this.client.chat(targetModelId);
  }

  async generateObject<T = any>(params: {
    model: string;
    system?: string;
    prompt?: string;
    messages?: any[];
    schema: any;
    maxTokens?: number;
    temperature?: number;
  }): Promise<GenerateObjectResult<T>> {
    const modelInstance = this.getModel(params.model);
    const config = AI_CONFIG.models[params.model];
    const maxTokens = params.maxTokens ?? config?.maxTokens ?? 8000;
    const temperature = params.temperature ?? config?.temperature ?? 0.2;

    const options: any = {
      model: modelInstance,
      system: params.system,
      schema: params.schema,
      maxTokens,
      temperature,
      mode: "json",
    };

    if (params.prompt) {
      options.prompt = params.prompt;
    } else if (params.messages) {
      options.messages = params.messages;
    }

    // ── Tier 1: Try SDK's native generateObject (JSON mode) ──
    try {
      return await sdkGenerateObject(options);
    } catch (jsonModeError: any) {
      logger.warn(`generateObject JSON mode failed for ${params.model}: ${jsonModeError.message || jsonModeError}. Falling back to text-based JSON extraction...`);
    }

    // ── Tier 2: Plain text generation + manual JSON parsing ──
    // Many free-tier models don't support structured output / JSON mode.
    // We ask the model to output JSON in plain text, then parse it ourselves.
    try {
      // Build a system prompt that instructs the model to output raw JSON
      const jsonSystemPrompt = [
        params.system || "",
        "\n\n## CRITICAL OUTPUT INSTRUCTION",
        "You MUST respond with ONLY valid JSON. No markdown, no explanation, no code fences.",
        "Output a single JSON object that matches the required schema.",
        "Do NOT wrap the JSON in ```json``` blocks or add any text before/after it.",
      ].join("\n");

      const textOptions: any = {
        model: modelInstance,
        system: jsonSystemPrompt,
        maxTokens,
        temperature,
      };

      if (params.prompt) {
        textOptions.prompt = params.prompt;
      } else if (params.messages) {
        textOptions.messages = params.messages;
      }

      const textResult = await sdkGenerateText(textOptions);
      const rawText = textResult.text || "";
      const cleanedJson = cleanContent(rawText);

      // Parse and validate the JSON
      const parsed = JSON.parse(cleanedJson);

      // If schema has a parse/safeParse method (Zod), validate against it
      if (params.schema && typeof params.schema.safeParse === "function") {
        const validation = params.schema.safeParse(parsed);
        if (validation.success) {
          // Construct a result object compatible with GenerateObjectResult
          return {
            object: validation.data,
            usage: textResult.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            response: textResult.response,
          } as any;
        } else {
          logger.warn("Text-based JSON parsed but failed Zod validation:", validation.error.errors);
          // Still return the parsed object — the caller's existing error handling
          // in provider.ts will attempt JSON repair via a secondary model call
          return {
            object: parsed as T,
            usage: textResult.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            response: textResult.response,
          } as any;
        }
      }

      // No Zod schema — return raw parsed object
      return {
        object: parsed as T,
        usage: textResult.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        response: textResult.response,
      } as any;
    } catch (textFallbackError: any) {
      logger.error(`Text-based JSON fallback also failed for ${params.model}: ${textFallbackError.message || textFallbackError}`);

      // Only mask as JSON error if it actually was a parsing failure
      if (textFallbackError instanceof SyntaxError) {
        throw new Error(
          JSON.stringify({
            status: 502,
            statusText: "Model JSON Error",
            message: `Free model ${params.model} failed to generate valid JSON output. Both structured mode and text fallback failed.`,
            type: "model_json_error",
          })
        );
      }

      // Propagate API errors (e.g. 429 Rate Limit) directly
      throw textFallbackError;
    }
  }

  async streamText(params: {
    model: string;
    system?: string;
    prompt?: string;
    messages?: any[];
    maxTokens?: number;
    temperature?: number;
  }): Promise<StreamTextResult<any, any>> {
    const modelInstance = this.getModel(params.model);
    const config = AI_CONFIG.models[params.model];
    const maxTokens = params.maxTokens ?? config?.maxTokens ?? 16000;
    const temperature = params.temperature ?? config?.temperature ?? 0.3;

    const options: any = {
      model: modelInstance,
      system: params.system,
      maxTokens,
      temperature,
    };

    if (params.prompt) {
      options.prompt = params.prompt;
    } else if (params.messages) {
      options.messages = params.messages;
    }

    return sdkStreamText(options);
  }
}
