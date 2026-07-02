import { logger } from "@/utils/logger";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export function classifyProviderError(error: unknown): {
  message: string;
  type: string;
  status: number;
} {
  const msg = getErrorMessage(error);
  
  // Try to parse structured error from our qevaro fetch wrapper
  try {
    const jsonStart = msg.indexOf("{");
    if (jsonStart !== -1) {
      const jsonStr = msg.slice(jsonStart);
      const parsed = JSON.parse(jsonStr);
      if (parsed.status && parsed.message) {
        return {
          message: parsed.message,
          type: parsed.type || "qevaro_error",
          status: parsed.status,
        };
      }
    } else {
      const parsed = JSON.parse(msg);
      if (parsed.status && parsed.message) {
        return {
          message: parsed.message,
          type: parsed.type || "qevaro_error",
          status: parsed.status,
        };
      }
    }
  } catch {
    // Message is not JSON, proceed with string matching
  }

  const lower = msg.toLowerCase();

  if (
    lower.includes("api key") ||
    lower.includes("api_key") ||
    lower.includes("invalid key") ||
    lower.includes("invalid api key")
  ) {
    const isProd = process.env.NODE_ENV === "production";
    return {
      message: isProd
        ? "Invalid or missing Qevaro API key. Please check QEVARO_API_KEY in your Vercel project environment variables."
        : "Invalid or missing Qevaro API key. Check QEVARO_API_KEY in .env.",
      type: "api_key_missing",
      status: 401,
    };
  }

  if (
    lower.includes("quota") ||
    lower.includes("rate") ||
    lower.includes("429") ||
    lower.includes("too many requests") ||
    lower.includes("exhausted")
  ) {
    return {
      message: "Qevaro rate limit or quota exceeded. Try again shortly.",
      type: "rate_limit",
      status: 429,
    };
  }

  if (
    lower.includes("unauthorized") || 
    lower.includes("401") ||
    lower.includes("forbidden") ||
    lower.includes("403")
  ) {
    return {
      message: "Qevaro authentication failed. Verify your API key.",
      type: "auth_failed",
      status: 401,
    };
  }

  if (lower.includes("timeout") || lower.includes("aborted") || lower.includes("408")) {
    return {
      message: "AI Generation request timed out. Please try again.",
      type: "timeout",
      status: 408,
    };
  }

  logger.error("api-errors", "Unclassified provider error", { msg, error });
  return {
    message: msg || "Qevaro provider error",
    type: "api_unavailable",
    status: 500,
  };
}

