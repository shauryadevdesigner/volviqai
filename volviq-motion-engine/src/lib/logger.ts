import { logger as baseLogger } from "@/utils/logger";

export const logger = {
  info(message: string, data?: unknown) {
    baseLogger.info("system", message, data);
  },
  warn(message: string, data?: unknown) {
    baseLogger.warn("system", message, data);
  },
  error(message: string, data?: unknown) {
    baseLogger.error("system", message, data);
  },
  debug(message: string, data?: unknown) {
    baseLogger.debug("system", message, data);
  },

  logQevaroRequest(model: string, promptPreview: string, isFollowUp: boolean) {
    baseLogger.info("Qevaro", `Request initiated for model: ${model}`, {
      model,
      isFollowUp,
      promptPreview: promptPreview.length > 100 ? `${promptPreview.slice(0, 100)}...` : promptPreview,
    });
  },

  logQevaroResponse(model: string, durationMs: number, success: boolean, details?: unknown) {
    baseLogger.info("Qevaro", `Response received for model: ${model} in ${durationMs}ms (Success: ${success})`, {
      model,
      durationMs,
      success,
      details,
    });
  },

  logTokenUsage(model: string, usage: { tokenQuotaTotal: number; tokenQuotaUsed: number; tokenQuotaRemaining: number }) {
    baseLogger.info("Qevaro:Quota", `Token usage for ${model}: ${usage.tokenQuotaUsed}/${usage.tokenQuotaTotal} (${usage.tokenQuotaRemaining} remaining)`, {
      model,
      ...usage,
    });
  },

  logModelSelection(model: string, phase: "primary" | "fallback" | "final_fallback") {
    baseLogger.info("AI:ModelSelection", `Model selected for execution: ${model} (Phase: ${phase})`, {
      model,
      phase,
    });
  },

  logFailure(errorType: string, message: string, details?: unknown) {
    baseLogger.error("AI:Failure", `Generation failed - Type: ${errorType} - Message: ${message}`, {
      errorType,
      message,
      details,
    });
  },

  logRenderDuration(durationMs: number) {
    baseLogger.info("Render", `Render completed in ${durationMs}ms`, { durationMs });
  }
};
