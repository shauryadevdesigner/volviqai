// ============================================================================
// Qevaro AI — API Client
// ============================================================================
//
// Reusable OpenAI-compatible client for the Qevaro API.
// Replaces the former API client with production-grade reliability.
// ============================================================================

import { createOpenAI } from "@ai-sdk/openai";
import { logger } from "../lib/logger";
import { usageStore } from "./usage-store";
import { getModelConfig } from "./model-router";
import type { QevaroCompletionParams, QevaroCompletionResponse, QevaroUsageMetrics } from "./types";
import dotenv from "dotenv";
import path from "path";

// Load environment variables dynamically based on execution path
if (!process.env.QEVARO_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), "volviq-motion-engine/.env") });
  if (!process.env.QEVARO_API_KEY) {
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  }
}

console.log("QEVARO_API_KEY loaded:", !!process.env.QEVARO_API_KEY);
console.log("QEVARO_BASE_URL loaded:", !!process.env.QEVARO_BASE_URL);

// ── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://api.qevaro.com/v1";
const DEFAULT_TIMEOUT_MS = 60_000; // Reduced to 60s
const DEFAULT_MAX_RETRIES = 2; // Reduced to 2
const MAX_TOKENS_CAP = 16000;

// ── Simple LRU Response Cache ───────────────────────────────────────────────

interface CacheEntry {
  response: QevaroCompletionResponse;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

function getCacheKey(params: QevaroCompletionParams): string {
  // Only cache non-streaming, deterministic requests
  if (params.stream) return "";
  const key = JSON.stringify({
    model: params.model,
    messages: params.messages,
    system: params.system,
    temperature: params.temperature,
    jsonMode: params.jsonMode,
  });
  return key;
}

function getCachedResponse(key: string): QevaroCompletionResponse | null {
  if (!key) return null;
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.response;
}

function setCachedResponse(key: string, response: QevaroCompletionResponse): void {
  if (!key) return;
  // Evict oldest entries if cache is full
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, {
    response,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ── Environment ─────────────────────────────────────────────────────────────

export function getQevaroApiKey(): string | undefined {
  return process.env.QEVARO_API_KEY;
}

export function getQevaroBaseUrl(): string {
  return process.env.QEVARO_BASE_URL || DEFAULT_BASE_URL;
}

// ── Clean JSON Content Helper ───────────────────────────────────────────────

function cleanContent(text: string): string {
  let cleaned = text.trim();
  
  // 1. Remove <think>...</think> blocks
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

// ── Custom Fetch with Retry / Timeout / Logging ─────────────────────────────

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
      // Not JSON body, leave as-is
    }
  }

  // Determine dynamic timeout based on model category
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  if (modelName) {
    const config = getModelConfig(modelName);
    if (config?.category === "reasoning" || config?.category === "qa") {
      timeoutMs = 90_000; // 90s for heavy reasoning/QA models
    } else {
      timeoutMs = 60_000; // 60s for standard and fast models
    }
  }

  let attempt = 0;
  const maxRetries = DEFAULT_MAX_RETRIES; // Use the configured default max retries (2)
  let delay = 2000;

  while (attempt < maxRetries) {
    // Create a fresh abort controller and timer for this attempt
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
      const response = await fetch(input, requestInit);
      clearTimeout(attemptTimeoutId);

      const duration = Date.now() - start;

      // Extract Qevaro quota headers if present
      const quotaTotal = response.headers.get("x-qevaro-token-quota-total");
      const quotaUsed = response.headers.get("x-qevaro-token-quota-used");
      const quotaRemaining = response.headers.get("x-qevaro-token-quota-remaining");

      if (quotaTotal && quotaUsed && quotaRemaining) {
        const quota: QevaroUsageMetrics = {
          tokenQuotaTotal: parseInt(quotaTotal, 10),
          tokenQuotaUsed: parseInt(quotaUsed, 10),
          tokenQuotaRemaining: parseInt(quotaRemaining, 10),
        };
        usageStore.updateQuota(quota);
      }

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

        logger.error(`Qevaro API error on ${url} (attempt ${attempt}): Status ${response.status}`, errorData);

        const errorMsg = errorData.error?.message || errorData.message || "";
        const errorType = errorData.error?.type || errorData.type || "";
        const combinedErrorStr = `${errorMsg} ${errorType}`.toLowerCase();
        
        const isDailyLimit = combinedErrorStr.includes("daily_request_limit") || 
                             combinedErrorStr.includes("daily model limit") ||
                             combinedErrorStr.includes("daily limit") ||
                             combinedErrorStr.includes("daily_limit_exceeded");
                             
        const isModelNotAvailable = response.status === 404 && (
          combinedErrorStr.includes("model") ||
          combinedErrorStr.includes("not found") ||
          combinedErrorStr.includes("not available") ||
          combinedErrorStr.includes("not enabled")
        );

        // Do NOT retry on permanent daily limits or model-not-available errors
        if ((isDailyLimit || isModelNotAvailable) || !((response.status === 429 || response.status >= 500) && attempt < maxRetries)) {
          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            message: errorData.error?.message || errorData.message || "Unknown Qevaro API error",
            type: errorData.error?.type || "qevaro_api_error",
          }));
        }

        // Retry on rate limits (429) or temporary server errors (5xx)
        let cooldownMs = delay;
        if (response.status === 429) {
          const remainingMinute = response.headers.get("x-ratelimit-remaining-requests-minute");
          const remainingHour = response.headers.get("x-ratelimit-remaining-requests-hour");
          const retryAfter = response.headers.get("retry-after");

          if (retryAfter) {
            cooldownMs = parseInt(retryAfter, 10) * 1000 || delay;
          } else if (remainingMinute === "0") {
            cooldownMs = 60000; // wait 1 minute
          } else if (remainingHour === "0") {
            cooldownMs = 120000; // wait 2 minutes (capped to avoid hanging indefinitely)
          }
          logger.warn(`Rate limit (429) hit on Qevaro request. Cooldown applied: ${cooldownMs}ms. Remaining Minute: ${remainingMinute}, Remaining Hour: ${remainingHour}`);
        } else {
          logger.warn(`Retrying Qevaro request in ${delay}ms due to status ${response.status}...`);
        }

        await new Promise((resolve) => setTimeout(resolve, cooldownMs));
        delay = cooldownMs * 2; // Exponential backoff based on cooldown
        continue;
      }

      logger.logQevaroResponse("QevaroRequest", duration, true);
      
      // Intercept and clean JSON response content (for non-streaming calls)
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
              
              // Clean headers that no longer apply to the uncompressed, modified body
              const cleanedHeaders = new Headers(response.headers);
              cleanedHeaders.delete("content-length");
              cleanedHeaders.delete("content-encoding");
              cleanedHeaders.delete("transfer-encoding");

              // Return new Response with the cleaned content
              return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: cleanedHeaders,
              });
            }
          }
        } catch (err) {
          logger.warn("Failed to parse/clean customFetch JSON response:", err);
        }
      }

      return response;
    } catch (error: any) {
      clearTimeout(attemptTimeoutId);
      const duration = Date.now() - start;
      const attemptDuration = Date.now() - attemptStart;

      const errorMessage = error.message || "";
      const isAbortOrTimeout = 
        error.name === "AbortError" || 
        errorMessage.includes("aborted") || 
        errorMessage.includes("timeout") ||
        errorMessage.includes("Timeout") ||
        errorMessage.includes("BodyStreamBuffer");

      if (isAbortOrTimeout) {
        logger.error(`Qevaro API timeout or abort on ${url} after ${attemptDuration}ms (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        if (attempt < maxRetries) {
          logger.warn(`Retrying after timeout/abort in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        // All retries exhausted — throw timeout error
        throw new Error(JSON.stringify({
          status: 408,
          statusText: "Timeout",
          message: `Request to Qevaro timed out or was aborted: ${errorMessage}`,
          type: "timeout_error",
        }));
      }

      // If it's already a structured error from our fetch check, rethrow immediately
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
        logger.logQevaroResponse("QevaroRequest", duration, false, error.message);
        throw new Error(JSON.stringify({
          status: 503,
          statusText: "Service Unavailable",
          message: error.message || "Network connection failed",
          type: "network_error",
        }));
      }

      logger.warn(`Qevaro network error on ${url} (attempt ${attempt}): ${error.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error(JSON.stringify({
    status: 503,
    statusText: "Service Unavailable",
    message: "Failed to connect to Qevaro after maximum retry attempts.",
    type: "network_error",
  }));
};

// ── AI SDK Client ───────────────────────────────────────────────────────────

/**
 * Creates an `@ai-sdk/openai`-compatible client pointing to the Qevaro API.
 * Used by the `generateContent()` provider for `generateObject` and `streamText`.
 */
export function getQevaroClient() {
  const apiKey = getQevaroApiKey();
  if (!apiKey) return null;
  return createOpenAI({
    baseURL: getQevaroBaseUrl(),
    apiKey,
    fetch: customFetch,
  });
}

// ── Direct Completion API ───────────────────────────────────────────────────

/**
 * Direct Qevaro completion API call.
 *
 * Features:
 * - Automatic retries with exponential backoff
 * - Timeout handling (60s default)
 * - Structured error responses
 * - Token usage tracking
 * - Response caching (5-minute TTL for identical non-streaming requests)
 * - Streaming support
 * - JSON mode support
 */
export async function createQevaroCompletion(
  params: QevaroCompletionParams,
): Promise<QevaroCompletionResponse> {
  const apiKey = getQevaroApiKey();
  if (!apiKey) {
    throw new Error("Qevaro API key is not configured. Set QEVARO_API_KEY in your environment.");
  }

  // Check cache first
  const cacheKey = getCacheKey(params);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    logger.info("Qevaro cache hit, returning cached response");
    return cached;
  }

  const baseUrl = getQevaroBaseUrl();
  const url = `${baseUrl}/chat/completions`;
  const retries = params.retries ?? DEFAULT_MAX_RETRIES;
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Build the messages array
  const messages: any[] = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  messages.push(...params.messages);

  // Build request body
  const requestBody: any = {
    model: params.model,
    messages,
    max_tokens: params.maxTokens ?? MAX_TOKENS_CAP,
    stream: params.stream ?? false,
  };

  if (params.temperature !== undefined) {
    requestBody.temperature = params.temperature;
  }

  if (params.jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const start = Date.now();
  let attempt = 0;
  let delay = 2000;

  while (attempt < retries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Extract quota headers
      const quotaTotal = response.headers.get("x-qevaro-token-quota-total");
      const quotaUsed = response.headers.get("x-qevaro-token-quota-used");
      const quotaRemaining = response.headers.get("x-qevaro-token-quota-remaining");

      let quotaMetrics: QevaroUsageMetrics | null = null;
      if (quotaTotal && quotaUsed && quotaRemaining) {
        quotaMetrics = {
          tokenQuotaTotal: parseInt(quotaTotal, 10),
          tokenQuotaUsed: parseInt(quotaUsed, 10),
          tokenQuotaRemaining: parseInt(quotaRemaining, 10),
        };
        usageStore.updateQuota(quotaMetrics);
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "Unknown error" };
        }

        const errorMsg = errorData.error?.message || errorData.message || `Qevaro API error: ${response.status}`;
        const errorType = errorData.error?.type || errorData.type || "";
        const combinedErrorStr = `${errorMsg} ${errorType}`.toLowerCase();

        const isDailyLimit = combinedErrorStr.includes("daily_request_limit") || 
                             combinedErrorStr.includes("daily model limit") ||
                             combinedErrorStr.includes("daily limit") ||
                             combinedErrorStr.includes("daily_limit_exceeded");
                             
        const isModelNotAvailable = response.status === 404 && (
          combinedErrorStr.includes("model") ||
          combinedErrorStr.includes("not found") ||
          combinedErrorStr.includes("not available") ||
          combinedErrorStr.includes("not enabled")
        );

        // Do NOT retry on permanent daily limits or model-not-available errors
        if ((isDailyLimit || isModelNotAvailable) || !((response.status === 429 || response.status >= 500) && attempt < retries)) {
          const latencyMs = Date.now() - start;
          usageStore.recordRequest({
            model: params.model,
            taskType: "direct_completion",
            latencyMs,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            success: false,
            error: errorMsg,
          });

          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            message: errorMsg,
            type: errorData.error?.type || "qevaro_api_error",
          }));
        }

        // Retry on rate limits or server errors

        // Retry on rate limits or server errors
        let cooldownMs = delay;
        if (response.status === 429) {
          const remainingMinute = response.headers.get("x-ratelimit-remaining-requests-minute");
          const remainingHour = response.headers.get("x-ratelimit-remaining-requests-hour");
          const retryAfter = response.headers.get("retry-after");

          if (retryAfter) {
            cooldownMs = parseInt(retryAfter, 10) * 1000 || delay;
          } else if (remainingMinute === "0") {
            cooldownMs = 60000; // wait 1 minute
          } else if (remainingHour === "0") {
            cooldownMs = 120000; // wait 2 minutes
          }
          logger.warn(`Rate limit (429) hit on Qevaro completion. Cooldown applied: ${cooldownMs}ms. Remaining Minute: ${remainingMinute}, Remaining Hour: ${remainingHour}`);
        } else {
          logger.warn(`Qevaro API error ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        }

        await new Promise((resolve) => setTimeout(resolve, cooldownMs));
        delay = cooldownMs * 2;
        continue;
      }

      const data = await response.json();
      const latencyMs = Date.now() - start;

      const result: QevaroCompletionResponse = {
        content: cleanContent(data.choices?.[0]?.message?.content ?? ""),
        model: data.model ?? params.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
        quotaMetrics,
        latencyMs,
        finishReason: data.choices?.[0]?.finish_reason ?? "unknown",
      };

      // Track usage
      usageStore.recordRequest({
        model: result.model,
        taskType: "direct_completion",
        latencyMs,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        success: true,
      });

      logger.logQevaroResponse(result.model, latencyMs, true);

      // Cache the response
      setCachedResponse(cacheKey, result);

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        const latencyMs = Date.now() - start;
        logger.error(`Qevaro completion timeout on ${url} after ${latencyMs}ms. Replacing model immediately.`);

        usageStore.recordRequest({
          model: params.model,
          taskType: "direct_completion",
          latencyMs,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          success: false,
          error: "Timeout",
        });

        throw new Error(JSON.stringify({
          status: 408,
          statusText: "Timeout",
          message: "Request to Qevaro timed out. Replacing model...",
          type: "timeout_error",
        }));
      }

      // Rethrow structured errors
      let isStructured = false;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.status) isStructured = true;
      } catch { /* not JSON */ }
      if (isStructured) throw error;

      // Retry on network errors
      if (attempt < retries) {
        logger.warn(`Qevaro network error (attempt ${attempt}/${retries}): ${error.message}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      const latencyMs = Date.now() - start;
      usageStore.recordRequest({
        model: params.model,
        taskType: "direct_completion",
        latencyMs,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        success: false,
        error: error.message,
      });

      throw new Error(JSON.stringify({
        status: 503,
        statusText: "Service Unavailable",
        message: error.message || "Failed to connect to Qevaro",
        type: "network_error",
      }));
    }
  }

  throw new Error(JSON.stringify({
    status: 503,
    statusText: "Service Unavailable",
    message: "Failed to connect to Qevaro after maximum retry attempts.",
    type: "network_error",
  }));
}
 