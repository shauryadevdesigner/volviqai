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
import {z} from "zod";

// ============================================================================
// Gemini Provider
// ============================================================================
// All text/code generation goes to Gemini's OpenAI-compatible API using GEMINI_API_KEY.
// (Previously this project routed everything through OpenRouter's free-tier
// models, which is why generation quality/speed/consistency were poor —
// see config.ts for details on what changed.)
// ============================================================================

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 60_000;
const ANTIGRAVITY_AGENT = "antigravity-preview-05-2026";
const ANTIGRAVITY_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

async function generateWithAntigravity(params: {
  system?: string;
  prompt?: string;
  messages?: any[];
}): Promise<{text: string; response: unknown; usage: {promptTokens: number; completionTokens: number; totalTokens: number}}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const textParts = [params.system || "", params.prompt || ""];
  const interactionInput: Array<Record<string, unknown>> = [];
  for (const message of params.messages ?? []) {
    for (const content of Array.isArray(message.content) ? message.content : [{type: "text", text: message.content}]) {
      if (content?.type === "text" && typeof content.text === "string") textParts.push(content.text);
      if (content?.type === "image_url" && typeof content.image_url?.url === "string") {
        const match = content.image_url.url.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (match) interactionInput.push({type: "image", mime_type: match[1], data: match[2]});
      }
    }
  }
  interactionInput.unshift({
    type: "text",
    text: `${textParts.filter(Boolean).join("\n\n")}\n\nReturn ONLY the complete raw TSX module. Export VolviqAnimation. Do not return markdown fences, JSON, commentary, or file attachments. Do not call tools, execute code, create files, or use the sandbox; answer directly with the TSX. Local Remotion compilation will validate it.`,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300_000);
  try {
    const response = await fetch(ANTIGRAVITY_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json", "x-goog-api-key": apiKey},
      signal: controller.signal,
      body: JSON.stringify({
        agent: ANTIGRAVITY_AGENT,
        input: interactionInput,
        environment: "remote",
        stream: false,
        // The task only needs model output. Avoid sandbox tool calls here:
        // they consume extra agent quota and can be permission-gated.
        tools: [],
        agent_config: {
          type: "antigravity",
          model: "gemini-3.6-flash",
          max_total_tokens: 32_000,
        },
      }),
    });
    const rawResponse = await response.text();
    let result: any;
    try {
      result = JSON.parse(rawResponse);
    } catch {
      const events: Array<{event?: string; data: any}> = [];
      let eventName: string | undefined;
      for (const line of rawResponse.split(/\r?\n/)) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          events.push({event: eventName, data: JSON.parse(data)});
        } catch {
          // Ignore non-JSON progress payloads; terminal events carry JSON.
        }
      }
      const textFromDeltas = events
        .filter((item) => item.data?.event_type === "step.delta" && item.data?.delta?.type === "text")
        .map((item) => item.data.delta.text)
        .join("");
      const completedEvent = events.find((item) => item.data?.event_type === "interaction.completed");
      const errorEvent = events.find((item) => item.event === "error" || item.data?.error);
      if (!completedEvent && errorEvent) {
        const error = errorEvent.data?.error ?? errorEvent.data;
        throw new Error(JSON.stringify({
          status: Number(error?.code || 500),
          statusText: error?.status || "Antigravity Error",
          message: error?.message || "Antigravity interaction failed",
          type: Number(error?.code) === 429 ? "rate_limit" : "antigravity_api_error",
        }));
      }
      result = events.map((item) => item.data).reverse().find((data) =>
        typeof data?.output_text === "string" || data?.status === "completed"
      ) ?? {};
      if (textFromDeltas) result.output_text = textFromDeltas;
      if (completedEvent?.data?.interaction?.usage) result.usage = completedEvent.data.interaction.usage;
    }
    if (!response.ok) {
      const message = result?.error?.message || `Antigravity request failed (${response.status})`;
      throw new Error(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        message,
        type: response.status === 429 ? "rate_limit" : "antigravity_api_error",
      }));
    }
    const collectText = (value: unknown, output: string[], depth = 0) => {
      if (depth > 5 || value == null) return;
      if (typeof value === "string") {
        output.push(value);
        return;
      }
      if (typeof value === "object") {
        Object.values(value as Record<string, unknown>)
          .forEach((child) => collectText(child, output, depth + 1));
      }
    };
    const modelOutputParts: string[] = [];
    for (const step of Array.isArray(result.steps) ? result.steps : []) {
      if (step?.type === "model_output") {
        collectText(step.content ?? step.output ?? step.text, modelOutputParts);
      }
    }
    const text = typeof result.output_text === "string"
      ? result.output_text
      : modelOutputParts.join("");
    const totalTokens = Number(result.usage?.total_tokens || 0);
    return {
      text,
      response: result,
      usage: {promptTokens: 0, completionTokens: 0, totalTokens},
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getRetryDelayMs(retryAfter: string | null, fallbackMs: number): number {
  if (!retryAfter) return fallbackMs;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) {
    return Math.min(Math.max(seconds * 1000, 0), MAX_RETRY_DELAY_MS);
  }

  const retryAt = Date.parse(retryAfter);
  if (Number.isFinite(retryAt)) {
    return Math.min(Math.max(retryAt - Date.now(), 0), MAX_RETRY_DELAY_MS);
  }

  return fallbackMs;
}

// ── Clean JSON Content Helper ───────────────────────────────────────────────

/**
 * Removes reasoning <think> blocks and extracts JSON blocks if present.
 * Prevents JSON parsing errors when models output explanation wrapper text.
 */
function cleanContent(text: string): string {
  let cleaned = text.trim();

  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }

  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

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

/** Normalize the common wrappers Gemini may add around a requested raw module. */
function extractRawTsx(text: string): string {
  let code = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  const fenced = code.match(/```(?:tsx|typescript|ts|jsx)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) code = fenced[1].trim();

  // Despite an explicit raw-code instruction, models occasionally return the
  // old {"code":"..."} envelope. Unwrap it instead of compiling the JSON.
  try {
    const parsed = JSON.parse(code);
    if (typeof parsed === "string") code = parsed.trim();
    else if (parsed && typeof parsed.code === "string") code = parsed.code.trim();
  } catch {
    // It was already raw TSX.
  }

  const moduleStartCandidates = [
    code.indexOf("import "),
    code.indexOf("export const VolviqAnimation"),
    code.indexOf("export function VolviqAnimation"),
  ].filter((index) => index >= 0);
  if (moduleStartCandidates.length > 0) {
    code = code.slice(Math.min(...moduleStartCandidates));
  }

  return code
    .replace(/^```(?:tsx|typescript|ts|jsx)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// ── Custom Fetch with Retry / Timeout / Error Handling ──────────────────────

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input.toString();
  const start = Date.now();

  const headers = new Headers(init?.headers);

  // Intercept request body to cap token limits and detect model name
  let body = init?.body;
  let modelName = "";
  let expectsStructuredJson = false;
  if (body && typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed.model) {
        modelName = parsed.model;
      }
      expectsStructuredJson =
        parsed.response_format?.type === "json_schema" ||
        parsed.response_format?.type === "json_object";
      // Gemini's OpenAI-compatible chat completions endpoint accepts
      // `max_tokens`, but rejects OpenAI's newer `max_output_tokens` field.
      // Normalize token-limit spellings emitted by SDK versions.
      const requestedMaxTokens =
        parsed.max_tokens ?? parsed.max_completion_tokens ?? parsed.max_output_tokens;
      // Leave enough room for the input under provider limits.
      // The lightweight planner has a 6K TPM ceiling, while code models need
      // a larger completion budget to return a complete component.
      const modelTokenCap = 32000;
      parsed.max_tokens = Math.min(requestedMaxTokens ?? modelTokenCap, modelTokenCap);
      delete parsed.max_completion_tokens;
      delete parsed.max_output_tokens;
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
      logger.info(`Gemini call initiated (Attempt ${attempt}/${maxRetries})`);

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

        logger.error(`Gemini API error on ${url} (attempt ${attempt}): Status ${response.status}`, errorData);

        const errorMsg = errorData.error?.message || errorData.message || "";
        const errorType = errorData.error?.type || errorData.type || "";
        const combinedErrorStr = `${errorMsg} ${errorType}`.toLowerCase();

        const isModelNotAvailable = response.status === 404 && (
          combinedErrorStr.includes("model") ||
          combinedErrorStr.includes("not found") ||
          combinedErrorStr.includes("not available")
        );

        // Fail-fast on client errors (400, 401, 403, 404) unless it's a transient 429
        const isTransient = (response.status === 429 || response.status >= 500);
        const shouldRetry = isTransient && !isModelNotAvailable && attempt < maxRetries;

        if (!shouldRetry) {
          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            message: errorData.error?.message || errorData.message || "Unknown Gemini API error",
            type: errorData.error?.type || "gemini_api_error",
          }));
        }

        // Apply backoff/cooldown for rate limits or transient errors
        let cooldownMs = delay;
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          cooldownMs = getRetryDelayMs(retryAfter, 20000);
          logger.warn(`Rate limit (429) hit on Gemini request. Cooldown applied: ${cooldownMs}ms.`);
        } else {
          logger.warn(`Retrying Gemini request in ${delay}ms due to status ${response.status}...`);
        }

        await new Promise((resolve) => setTimeout(resolve, cooldownMs));
        delay = cooldownMs * 2;
        continue;
      }

      logger.info(`Gemini response received in ${duration}ms (Success: true)`);

      // Only clean responses that explicitly requested JSON. Raw TSX contains
      // many brace-delimited objects; running the JSON extractor over code can
      // mistake an inner style/config object for the entire model response.
      const contentType = response.headers.get("content-type");
      if (
        expectsStructuredJson &&
        contentType &&
        contentType.includes("application/json")
      ) {
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
        logger.error(`Gemini API timeout or abort on ${url} after ${attemptDuration}ms (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        if (attempt < maxRetries) {
          logger.warn(`Retrying after timeout/abort in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw new Error(JSON.stringify({
          status: 408,
          statusText: "Timeout",
          message: `Request to Gemini timed out or was aborted: ${errorMessage}`,
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
        logger.error(`Gemini call failed after maximum retries. Error: ${error.message}`);
        throw new Error(JSON.stringify({
          status: 503,
          statusText: "Service Unavailable",
          message: error.message || "Network connection failed",
          type: "network_error",
        }));
      }

      logger.warn(`Gemini network error (attempt ${attempt}): ${error.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error(JSON.stringify({
    status: 503,
    statusText: "Service Unavailable",
    message: "Failed to connect to Gemini after maximum retry attempts.",
    type: "network_error",
  }));
};

// ── Gemini Provider Implementation ─────────────────────────────────────────

export class OpenAIProviderImpl implements AIProvider {
  readonly name = "gemini";
  private client: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = createOpenAI({
      apiKey: apiKey || "",
      baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
      fetch: customFetch,
    });
  }

  private getModel(modelName: string) {
    const config = AI_CONFIG.models[modelName];
    const targetModelId = config?.id || AI_CONFIG.models[AI_CONFIG.defaultModel]?.id || ANTIGRAVITY_AGENT;
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
    const schemaJson = z.toJSONSchema(params.schema) as {
      properties?: Record<string, unknown>;
      required?: string[];
    };
    const schemaKeys = Object.keys(schemaJson.properties ?? {});
    const isCodeOnlySchema = schemaKeys.length === 1
      && schemaKeys[0] === "code"
      && schemaJson.required?.includes("code");

    // Large TSX modules are unreliable when JSON-escaped: JSX quotes and
    // template literals commonly lead to truncated or malformed JSON. Ask
    // Gemini for the module directly, then keep Zod + Remotion compilation as
    // the acceptance gates. This uses one model request instead of JSON repair
    // and fallback calls, materially reducing free-tier quota usage.
    if (isCodeOnlySchema) {
      const codeResult = params.model === ANTIGRAVITY_AGENT
        ? await generateWithAntigravity(params)
        : await sdkGenerateText({
            model: modelInstance,
            system: `${params.system || ""}\n\nReturn ONLY the complete raw TSX module. Do not use markdown fences, JSON, commentary, or an array.`,
            ...(params.prompt ? {prompt: params.prompt} : {messages: params.messages}),
            maxTokens,
            temperature,
          } as any);
      const code = extractRawTsx(codeResult.text || "");
      if (!code.includes("VolviqAnimation") || !/<[A-Za-z][^>]*>/.test(code)) {
        logger.warn("Gemini raw-code response was not a TSX module", {
          model: params.model,
          responsePreview: (codeResult.text || "").slice(0, 240),
        });
        throw new Error(JSON.stringify({
          status: 502,
          statusText: "Model Code Error",
          message: `Gemini model ${params.model} did not return a Remotion TSX component.`,
          type: "model_code_error",
        }));
      }
      const validation = params.schema.safeParse({code});
      if (!validation.success) {
        throw new Error(JSON.stringify({
          status: 502,
          statusText: "Model Code Error",
          message: `Gemini model ${params.model} did not return a complete TSX module.`,
          type: "model_code_error",
        }));
      }
      return {
        object: validation.data,
        usage: codeResult.usage || {promptTokens: 0, completionTokens: 0, totalTokens: 0},
        response: codeResult.response,
      } as any;
    }

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
    if (params.model !== "gemini-2.5-flash") {
      try {
        return await sdkGenerateObject(options);
      } catch (jsonModeError: any) {
        logger.warn(`generateObject JSON mode failed for ${params.model}: ${jsonModeError.message || jsonModeError}. Falling back to text-based JSON extraction...`);
      }
    }

    // ── Tier 2: Plain text generation + manual JSON parsing (safety net) ──
    try {
      const requiredJsonSchema = JSON.stringify(z.toJSONSchema(params.schema));
      const jsonContract = [
        "You MUST respond with ONLY one valid JSON object.",
        "No markdown, explanation, code fences, or top-level arrays.",
        `Required JSON Schema: ${requiredJsonSchema}`,
      ].join("\n");
      const jsonSystemPrompt = [
        params.system || "",
        "\n\n## CRITICAL OUTPUT INSTRUCTION",
        jsonContract,
      ].join("\n");

      const textOptions: any = {
        model: modelInstance,
        system: jsonSystemPrompt,
        maxTokens,
        temperature,
      };

      if (params.prompt) {
        // Repeat the contract in the user turn. Gemini 3.5 can underweight
        // system-only formatting constraints on long code-generation prompts.
        textOptions.prompt = `${params.prompt}\n\n## REQUIRED RESPONSE FORMAT\n${jsonContract}`;
      } else if (params.messages) {
        textOptions.messages = params.messages;
      }

      const textResult = await sdkGenerateText(textOptions);
      const rawText = textResult.text || "";
      const cleanedJson = cleanContent(rawText);

      const parsed = JSON.parse(cleanedJson);

      if (params.schema && typeof params.schema.safeParse === "function") {
        let validation = params.schema.safeParse(parsed);

        // Gemini may put the single requested object inside a JSON array.
        // Accept one element only when that element independently satisfies
        // the exact requested schema.
        if (!validation.success && Array.isArray(parsed)) {
          const validElements = parsed
            .map((item) => params.schema.safeParse(item))
            .filter((result: any) => result.success);
          if (validElements.length === 1) {
            validation = validElements[0];
          } else {
            const fragments: string[] = [];
            const collectArrayStrings = (value: unknown, depth = 0) => {
              if (depth > 3 || value == null) return;
              if (typeof value === "string") {
                fragments.push(value);
              } else if (typeof value === "object") {
                Object.values(value as Record<string, unknown>)
                  .forEach((child) => collectArrayStrings(child, depth + 1));
              }
            };
            collectArrayStrings(parsed);
            const joinedCode = fragments.join("\n");
            if (joinedCode.length >= 20) {
              validation = params.schema.safeParse({code: joinedCode});
            }
          }
        }

        // Gemini occasionally wraps a requested `{code: string}` result one
        // level deeper (for example `{result: {code: "..."}}`) even when the
        // JSON instruction is explicit. Recover only an unmistakable complete
        // TSX module, then let the original Zod schema remain the authority.
        if (!validation.success && parsed && typeof parsed === "object") {
          const findCodeModule = (value: unknown, depth = 0): string | undefined => {
            if (depth > 3 || value == null) return undefined;
            if (typeof value === "string") {
              return value.includes("VolviqAnimation") && value.includes("remotion")
                ? value
                : undefined;
            }
            if (typeof value !== "object") return undefined;
            if (Array.isArray(value)) {
              const fragments: string[] = [];
              const collectStrings = (item: unknown, nestedDepth = 0) => {
                if (nestedDepth > 3 || item == null) return;
                if (typeof item === "string") {
                  fragments.push(item);
                  return;
                }
                if (typeof item === "object") {
                  Object.values(item as Record<string, unknown>)
                    .forEach((child) => collectStrings(child, nestedDepth + 1));
                }
              };
              collectStrings(value);
              const joined = fragments.join("\n");
              if (joined.includes("VolviqAnimation") && joined.includes("remotion")) {
                return joined;
              }
            }
            for (const child of Object.values(value as Record<string, unknown>)) {
              const found = findCodeModule(child, depth + 1);
              if (found) return found;
            }
            return undefined;
          };
          const recoveredCode = findCodeModule(parsed);
          if (recoveredCode) {
            validation = params.schema.safeParse({
              ...(parsed as Record<string, unknown>),
              code: recoveredCode,
            });
          }
        }
        if (validation.success) {
          return {
            object: validation.data,
            usage: textResult.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            response: textResult.response,
          } as any;
        } else {
          logger.warn("Text-based JSON parsed but failed Zod validation:", validation.error.issues);
          throw new Error(
            JSON.stringify({
              status: 502,
              statusText: "Model Schema Error",
              message: `Gemini model ${params.model} returned JSON that does not match the required schema.`,
              type: "model_schema_error",
            }),
          );
        }
      }

      return {
        object: parsed as T,
        usage: textResult.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        response: textResult.response,
      } as any;
    } catch (textFallbackError: any) {
      logger.error(`Text-based JSON fallback also failed for ${params.model}: ${textFallbackError.message || textFallbackError}`);

      if (textFallbackError instanceof SyntaxError) {
        throw new Error(
          JSON.stringify({
            status: 502,
            statusText: "Model JSON Error",
            message: `Model ${params.model} failed to generate valid JSON output. Both structured mode and text fallback failed.`,
            type: "model_json_error",
          })
        );
      }

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


