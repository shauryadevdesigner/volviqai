import type { GenerationErrorType } from "@/types/generation";

export type GenerationErrorCode =
  | "api_key_missing"
  | "api_unavailable"
  | "rate_limit"
  | "daily_limit_exceeded"
  | "model_not_available"
  | "auth_failed"
  | "invalid_prompt"
  | "network_error"
  | "render_failed"
  | "limit_reached"
  | "unknown";

export interface UserFacingGenerationError {
  code: GenerationErrorCode;
  title: string;
  message: string;
  action: string;
  type: GenerationErrorType;
  httpStatus?: number;
  detail?: string;
}

export class GenerationError extends Error {
  readonly userError: UserFacingGenerationError;

  constructor(userError: UserFacingGenerationError, cause?: unknown) {
    super(userError.message);
    this.name = "GenerationError";
    this.userError = userError;
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

function includesAny(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

export function classifyGenerationError(
  error: unknown,
  context?: {
    httpStatus?: number;
    apiType?: string;
    responseBody?: unknown;
  },
): UserFacingGenerationError {
  let httpStatus = context?.httpStatus;
  let apiType = context?.apiType;
  let raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  // Try to parse structured JSON error from the Groq fetch wrapper.
  try {
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      const jsonStr = raw.slice(jsonStart);
      const parsed = JSON.parse(jsonStr);
      if (parsed.status && parsed.message) {
        raw = parsed.message;
        httpStatus = parsed.status;
        apiType = parsed.type;
      }
    } else {
      const parsed = JSON.parse(raw);
      if (parsed.status && parsed.message) {
        raw = parsed.message;
        httpStatus = parsed.status;
        apiType = parsed.type;
      }
    }
  } catch {
    // Error is not JSON, proceed
  }

  const bodyStr =
    typeof context?.responseBody === "object" &&
    context.responseBody !== null &&
    "error" in context.responseBody
      ? String((context.responseBody as { error: unknown }).error)
      : "";

  const combined = bodyStr && bodyStr !== raw ? `${raw} ${bodyStr}`.trim() : raw.trim();

  if (apiType === "unauthorized") {
    return {
      code: "auth_failed",
      title: "Session Expired",
      message: combined || "Your session is invalid or expired.",
      action: "Sign in again to continue generating.",
      type: "api",
      httpStatus: httpStatus ?? 401,
      detail: raw,
    };
  }

  if (apiType === "validation") {
    return {
      code: "invalid_prompt",
      title: "Invalid Prompt",
      message: combined || "This prompt cannot be used for motion graphics generation.",
      action: "Describe a visual animation, chart, or motion graphic you want to create.",
      type: "validation",
      httpStatus,
      detail: raw,
    };
  }

  if (apiType === "stream_error") {
    return {
      code: "api_unavailable",
      title: "Generation Interrupted",
      message: combined || "The generation stream was interrupted.",
      action: "Try retrying your prompt or upgrading your deployment resources.",
      type: "api",
      httpStatus,
      detail: raw,
    };
  }

  if (apiType === "limit" || httpStatus === 402) {
    return {
      code: "limit_reached",
      title: "Generation Limit Reached",
      message: combined || "You have used all generations for this billing period.",
      action: "Upgrade your plan in Billing settings or wait until your quota resets.",
      type: "api",
      httpStatus: httpStatus ?? 402,
      detail: raw,
    };
  }

  if (
    apiType === "api_key_missing" ||
    includesAny(combined, [
      "gemini is not configured",
      "openai is not configured",
      "groq is not configured",
      "api key",
      "api_key",
      "missing key",
      "invalid api key",
      "google_generative_ai_api_key",
      "gemini_api_key",
      "openai_api_key",
      "groq_api_key",
    ])
  ) {
    const isProd = process.env.NODE_ENV === "production";
    return {
      code: "api_key_missing",
      title: "API Key Missing",
      message: isProd
        ? "Gemini is not configured. Set GEMINI_API_KEY in your deployment environment."
        : "Gemini is not configured. Add GEMINI_API_KEY to volviq-motion-engine/.env and restart the dev server.",
      action: isProd
        ? "Configure GEMINI_API_KEY in your deployment settings and trigger a redeployment."
        : "Set your API key in .env, then run npm run dev again.",
      type: "api",
      httpStatus: httpStatus ?? 400,
      detail: raw,
    };
  }

  // ── 429: Daily model request limit ──────────────────────────────────
  // Must be checked BEFORE generic rate_limit to provide accurate message
  if (
    httpStatus === 429 &&
    includesAny(combined, [
      "model_daily_request_limit_exceeded",
      "daily_request_limit",
      "daily model limit",
      "daily limit",
      "daily request",
    ])
  ) {
    return {
      code: "daily_limit_exceeded",
      title: "Daily Model Limit Reached",
      message:
        "You've reached the daily request limit for this model. Your quota will reset in a few hours.",
      action:
        "Switch to Gemini 3.5 Flash Lite or Gemini 3.1 Flash Lite in the model selector — they have separate quotas. Or wait for the quota to reset.",
      type: "api",
      httpStatus: 429,
      detail: raw,
    };
  }

  // ── 404: Model not available / not enabled ─────────────────────────
  if (
    httpStatus === 404 &&
    includesAny(combined, [
      "model",
      "not found",
      "not available",
      "not enabled",
      "does not exist",
      "unsupported model",
    ])
  ) {
    return {
      code: "model_not_available",
      title: "Model Not Available",
      message:
        combined ||
        "The requested model is not available or not enabled for your API key.",
      action:
        "Switch to Gemini 3.6 Flash, Gemini 3.5 Flash Lite, or Gemini 3.1 Flash Lite in the model selector.",
      type: "api",
      httpStatus: 404,
      detail: raw,
    };
  }

  // ── Generic rate limit (429 without daily-specific message) ────────
  if (
    includesAny(combined, [
      "rate limit",
      "quota",
      "resource exhausted",
      "429",
      "too many requests",
    ])
  ) {
    return {
      code: "rate_limit",
      title: "Rate Limit Hit",
      message: combined || "The AI provider rate limit was exceeded (too many requests).",
      action: "Wait 30 seconds and retry. If this persists, switch to a different model: Gemini 3.5 Flash Lite or Gemini 3.1 Flash Lite.",
      type: "api",
      httpStatus: httpStatus ?? 429,
      detail: raw,
    };
  }

  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    includesAny(combined, [
      "unauthorized",
      "authentication",
      "401",
      "403",
      "permission denied",
    ])
  ) {
    return {
      code: "auth_failed",
      title: "Authentication Failed",
      message: combined || "Could not authenticate with the AI service.",
      action: "Verify GEMINI_API_KEY and confirm the selected Gemini model is allowed for this project.",
      type: "api",
      httpStatus: httpStatus ?? 401,
      detail: raw,
    };
  }

  if (
    includesAny(combined, [
      "failed to fetch",
      "network",
      "econnrefused",
      "enotfound",
      "timeout",
      "aborted",
    ])
  ) {
    return {
      code: "network_error",
      title: "Network Error",
      message: combined || "Could not reach the generation API.",
      action: "Check your internet connection and that the dev server is running.",
      type: "api",
      detail: raw,
    };
  }

  if (includesAny(combined, ["render", "remotion", "composition"])) {
    return {
      code: "render_failed",
      title: "Render Failed",
      message: combined || "Video rendering encountered an error.",
      action: "Fix compilation errors in the preview, then try rendering again.",
      type: "api",
      detail: raw,
    };
  }

  if (
    includesAny(combined, [
      "service unavailable",
      "503",
      "502",
      "500",
      "internal server",
      "something went wrong",
    ])
  ) {
    return {
      code: "api_unavailable",
      title: "AI Service Error",
      message: combined || "The AI service returned an error.",
      action: "Retry in a moment. If this persists, switch to Gemini 3.5 Flash Lite or Gemini 3.1 Flash Lite.",
      type: "api",
      httpStatus: httpStatus ?? 500,
      detail: raw,
    };
  }

  if (combined === "Error" || !combined) {
    const detailText = raw && raw !== "Error" ? `: ${raw}` : "";
    return {
      code: "unknown",
      title: "Generation Error",
      message:
        `An unexpected error occurred during generation${detailText}.`,
      action: "Open DevTools → Console for details. Ensure GEMINI_API_KEY is set. Try switching to Gemini 3.5 Flash Lite or Gemini 3.1 Flash Lite.",
      type: "api",
      detail: raw || "Empty error message",
    };
  }

  return {
    code: "unknown",
    title: "Generation Error",
    message: combined,
    action: "Try retrying or switching to a different model: Gemini 3.5 Flash Lite or Gemini 3.1 Flash Lite.",
    type: "api",
    httpStatus,
    detail: raw,
  };
}

/** Extract message from AI SDK / SSE stream error events */
export function extractStreamEventError(event: unknown): string {
  if (!event || typeof event !== "object") {
    return "Unknown stream error";
  }
  const e = event as Record<string, unknown>;

  if (typeof e.errorText === "string" && e.errorText) return e.errorText;
  if (typeof e.message === "string" && e.message) return e.message;
  if (typeof e.error === "string" && e.error) return e.error;

  if (e.error && typeof e.error === "object") {
    const nested = e.error as Record<string, unknown>;
    if (typeof nested.message === "string") return nested.message;
    if (typeof nested.errorText === "string") return nested.errorText;
  }

  try {
    return JSON.stringify(event);
  } catch {
    return "Stream error (unparseable)";
  }
}

export function logFullGenerationError(
  error: unknown,
  context: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error && typeof error === "object" && "cause" in error
      ? (error as { cause: unknown }).cause
      : undefined;
  console.warn("Generation request failed", { message, cause, ...context });
}
