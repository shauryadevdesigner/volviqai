import {
  extractComponentCode,
  stripMarkdownFences,
  validateGptResponse,
  validateAndRepairJSX,
} from "@/helpers/sanitize-response";
import {
  classifyGenerationError,
  extractStreamEventError,
  GenerationError,
  logFullGenerationError,
  type UserFacingGenerationError,
} from "@/lib/generation-errors";
import { startTimer, trackMetric } from "@/lib/monitoring";
import type {
  AssistantMetadata,
  ConversationContextMessage,
  ErrorCorrectionContext,
} from "@/types/conversation";
import type {
  GenerationErrorType,
  ModelId,
  StreamPhase,
} from "@/types/generation";
import { logger } from "@/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";

interface FailedEditInfo {
  description: string;
  old_string: string;
  new_string: string;
}

interface GenerationCallbacks {
  onCodeGenerated?: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onStreamPhaseChange?: (phase: StreamPhase) => void;
  onError?: (
    error: string,
    type: GenerationErrorType,
    failedEdit?: FailedEditInfo,
    userError?: UserFacingGenerationError,
  ) => void;
  onMessageSent?: (prompt: string, attachedImages?: string[]) => void;
  onGenerationComplete?: (
    code: string,
    summary?: string,
    metadata?: AssistantMetadata,
  ) => void;
  onErrorMessage?: (
    message: string,
    errorType: "edit_failed" | "api" | "validation",
    failedEdit?: FailedEditInfo,
  ) => void;
  onPendingMessage?: (skills?: string[]) => void;
  onClearPendingMessage?: () => void;
}

interface GenerationContext {
  currentCode?: string;
  conversationHistory: ConversationContextMessage[];
  previouslyUsedSkills: string[];
  isFollowUp: boolean;
  hasManualEdits: boolean;
  errorCorrection?: ErrorCorrectionContext;
  frameImages?: string[];
}

interface UseGenerationApiOptions {
  accessToken?: string | null;
}

interface UseGenerationApiReturn {
  isLoading: boolean;
  runGeneration: (
    prompt: string,
    model: ModelId,
    context: GenerationContext,
    callbacks: GenerationCallbacks,
    options?: { silent?: boolean },
  ) => Promise<void>;
  abortActiveRequest: () => void;
}

function parseApiErrorBody(
  errorData: Record<string, unknown>,
  status: number,
): UserFacingGenerationError {
  const apiType =
    typeof errorData.type === "string" ? errorData.type : undefined;

  // Extract the error message from various response shapes
  // Qevaro / OpenAI-style: { error: { message: "...", type: "..." } }
  // Flat style:            { error: "..." }
  // Alt flat:              { message: "..." }
  let message: string;
  if (
    errorData.error &&
    typeof errorData.error === "object" &&
    typeof (errorData.error as Record<string, unknown>).message === "string"
  ) {
    message = (errorData.error as Record<string, unknown>).message as string;
  } else if (typeof errorData.error === "string") {
    message = errorData.error;
  } else if (typeof errorData.message === "string") {
    message = errorData.message;
  } else {
    message = `API error: ${status}`;
  }

  // Derive the effective API error type (prefer nested type from Qevaro)
  const effectiveApiType =
    apiType ||
    (errorData.error &&
      typeof errorData.error === "object" &&
      typeof (errorData.error as Record<string, unknown>).type === "string"
        ? ((errorData.error as Record<string, unknown>).type as string)
        : undefined);

  if (
    effectiveApiType === "api_key_missing" ||
    (status === 400 && (message.toLowerCase().includes("gemini is not configured") || message.toLowerCase().includes("qevaro is not configured")))
  ) {
    return classifyGenerationError(message, {
      httpStatus: status,
      apiType: "api_key_missing",
      responseBody: errorData,
    });
  }

  return classifyGenerationError(message, {
    httpStatus: status,
    apiType: effectiveApiType,
    responseBody: errorData,
  });
}

function processStreamEvent(
  event: Record<string, unknown>,
  handlers: {
    onStreamPhaseChange?: (phase: StreamPhase) => void;
    onPendingMessage?: (skills?: string[]) => void;
    onCodeGenerated?: (code: string) => void;
    accumulatedText: { value: string };
    streamMetadata: AssistantMetadata;
  },
): void {
  const type = event.type;

  if (type === "code-reset") {
    handlers.accumulatedText.value = "";
    handlers.onCodeGenerated?.("");
    return;
  }

  if (type === "metadata") {
    const skills = event.skills as string[] | undefined;
    handlers.streamMetadata.skills = skills;
    handlers.onPendingMessage?.(skills);
    return;
  }

  if (type === "reasoning-start") {
    const phase = event.phase as StreamPhase | undefined;
    handlers.onStreamPhaseChange?.(phase || "reasoning");
    return;
  }

  if (type === "text-start") {
    handlers.onStreamPhaseChange?.("generating");
    return;
  }

  if (type === "text-delta") {
    const delta = event.delta;
    if (typeof delta === "string") {
      handlers.accumulatedText.value += delta;
      const codeToShow = stripMarkdownFences(handlers.accumulatedText.value);
      handlers.onCodeGenerated?.(codeToShow);
    }
    return;
  }

  // Handle server-side code correction events (JSX auto-repair)
  if (type === "code-correction") {
    const correctedCode = event.correctedCode;
    const repairs = event.repairs as string[] | undefined;
    if (typeof correctedCode === "string") {
      handlers.accumulatedText.value = correctedCode;
      handlers.onCodeGenerated?.(correctedCode);
      if (repairs?.length) {
        console.log(`[Client] Server applied JSX repairs: ${repairs.join("; ")}`);
      }
    }
    return;
  }

  if (type === "error") {
    const msg = extractStreamEventError(event);
    throw new GenerationError(
      classifyGenerationError(msg, { apiType: "stream_error" }),
    );
  }
}

export function useGenerationApi(
  apiOptions?: UseGenerationApiOptions,
): UseGenerationApiReturn {
  const accessToken = apiOptions?.accessToken;
  const [isLoading, setIsLoading] = useState(false);
  // Use a ref to strictly prevent concurrent calls across renders
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const runGeneration = useCallback(
    async (
      prompt: string,
      model: ModelId,
      context: GenerationContext,
      callbacks: GenerationCallbacks,
      options?: { silent?: boolean },
    ) => {
      // Check both state and ref for robustness
      if (!prompt.trim() || isLoading || isGeneratingRef.current) return;

      // Abort any existing active request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const {
        currentCode,
        conversationHistory,
        previouslyUsedSkills,
        isFollowUp,
        hasManualEdits,
        errorCorrection,
        frameImages,
      } = context;

      const {
        onCodeGenerated,
        onStreamingChange,
        onStreamPhaseChange,
        onError,
        onMessageSent,
        onGenerationComplete,
        onErrorMessage,
        onPendingMessage,
        onClearPendingMessage,
      } = callbacks;

      const requestBody = {
        prompt,
        model,
        currentCode: isFollowUp ? currentCode : undefined,
        conversationHistory: isFollowUp ? conversationHistory : [],
        previouslyUsedSkills: isFollowUp ? previouslyUsedSkills : [],
        isFollowUp,
        hasManualEdits,
        errorCorrection,
        frameImages,
      };

      isGeneratingRef.current = true;
      setIsLoading(true);
      onStreamingChange?.(true);
      onStreamPhaseChange?.("reasoning");

      if (!options?.silent) {
        onMessageSent?.(prompt, frameImages);
      }

      const endTimer = startTimer();
      trackMetric({ kind: "generation_request", meta: { model, isFollowUp } });

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        logger.info("generation", "POST /api/generate", {
          model,
          isFollowUp,
          promptLength: prompt.length,
          hasImages: Boolean(frameImages?.length),
        });

        const response = await fetch("/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        });

        const contentType = response.headers.get("content-type") || "";
        let errorData: Record<string, unknown> = {};

        // ── STEP 1: Check HTTP status BEFORE treating response as stream ──
        // API errors (429, 404, etc.) return valid JSON error bodies.
        // We MUST parse them here instead of falling through to stream
        // handling, which would misinterpret the JSON as an aborted stream
        // and show a misleading "Network Error".
        if (!response.ok) {
          try {
            errorData = (await response.json()) as Record<string, unknown>;
          } catch {
            errorData = { error: await response.text().catch(() => "") };
          }

          logFullGenerationError(new Error("API request failed"), {
            status: response.status,
            contentType,
            requestBody,
            responseBody: errorData,
          });

          const userError = parseApiErrorBody(errorData, response.status);

          // Log the real error code so devs can see what actually happened
          logger.warn("generation", `API returned ${response.status}: ${userError.code}`, {
            status: response.status,
            errorCode: userError.code,
            errorTitle: userError.title,
            apiType: errorData.type,
          });

          if (errorData.type === "edit_failed") {
            const failedEdit = errorData.failedEdit as
              | FailedEditInfo
              | undefined;
            onError?.(userError.message, "validation", failedEdit, userError);
            onErrorMessage?.(userError.message, "edit_failed", failedEdit);
            trackMetric({
              kind: "generation_failure",
              durationMs: endTimer(),
              success: false,
              meta: { code: userError.code, httpStatus: response.status },
            });
            return;
          }

          if (errorData.type === "validation") {
            onError?.(userError.message, "validation", undefined, userError);
            onErrorMessage?.(userError.message, "validation");
            trackMetric({
              kind: "generation_failure",
              durationMs: endTimer(),
              success: false,
              meta: { code: userError.code, httpStatus: response.status },
            });
            return;
          }

          // For 429/404 and other API errors: surface the real error
          // through onError so the UI displays the accurate message
          // instead of a generic "Network Error".
          onError?.(userError.message, userError.type, undefined, userError);
          onErrorMessage?.(userError.message, "api");
          trackMetric({
            kind: "generation_failure",
            durationMs: endTimer(),
            success: false,
            meta: { code: userError.code, httpStatus: response.status },
          });
          return;
        }

        // ── STEP 2: Only handle successful (200) responses below ──
        // At this point response.ok is true (HTTP 200-299).

        if (contentType.includes("application/json")) {
          const data = await response.json();
          logger.info("generation", "JSON response received", {
            hasCode: Boolean(data.code),
            editType: data.metadata?.editType,
          });

          const { code, summary, metadata } = data;
          onCodeGenerated?.(code);
          onGenerationComplete?.(code, summary, metadata);
          const validation = validateGptResponse(code);
          if (!validation.isValid && validation.error) {
            const userError = classifyGenerationError(validation.error, {
              apiType: "validation",
            });
            onError?.(validation.error, "validation", undefined, userError);
          }
          trackMetric({
            kind: "generation_success",
            durationMs: endTimer(),
            success: true,
          });
          return;
        }

        // ── STEP 3: Stream handling — only for valid 200 streaming responses ──
        if (!contentType.includes("text/event-stream") && !contentType.includes("text/plain")) {
          // Unexpected content type on a 200 response — don't blindly stream
          logger.warn("generation", "Unexpected content-type on 200 response", {
            contentType,
          });
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new GenerationError(
            classifyGenerationError("No response body from generation API"),
          );
        }

        const decoder = new TextDecoder();
        const accumulatedText = { value: "" };
        let buffer = "";
        const streamMetadata: AssistantMetadata = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            let event: unknown;
            try {
              event = JSON.parse(data);
            } catch (parseErr) {
              logger.debug("generation", "Skipping non-JSON SSE line", {
                data: data.slice(0, 120),
                parseErr,
              });
              continue;
            }

            if (!event || typeof event !== "object") continue;

            processStreamEvent(event as Record<string, unknown>, {
              onStreamPhaseChange,
              onPendingMessage,
              onCodeGenerated,
              accumulatedText,
              streamMetadata,
            });
          }
        }

        let finalCode = stripMarkdownFences(accumulatedText.value);
        finalCode = extractComponentCode(finalCode);

        // ── Client-Side JSX Validation & Auto-Repair ──────────────────
        // Run structural validation on the final accumulated code.
        // This catches issues not caught by the server-side pass.
        const jsxValidation = validateAndRepairJSX(finalCode);
        if (!jsxValidation.isValid && jsxValidation.repairs.length > 0) {
          console.log(`[Client] JSX auto-repairs applied: ${jsxValidation.repairs.join("; ")}`);
          finalCode = jsxValidation.code;
        }

        onCodeGenerated?.(finalCode);
        onClearPendingMessage?.();
        onGenerationComplete?.(
          finalCode,
          undefined,
          streamMetadata.skills?.length ? streamMetadata : undefined,
        );

        const validation = validateGptResponse(finalCode);
        if (!validation.isValid && validation.error) {
          const userError = classifyGenerationError(validation.error, {
            apiType: "validation",
          });
          onError?.(validation.error, "validation", undefined, userError);
        }

        trackMetric({
          kind: "generation_success",
          durationMs: endTimer(),
          success: true,
          meta: { streamed: true },
        });
      } catch (error) {
        // Skip error handling for user-initiated abort (e.g. cancel button)
        if (error instanceof DOMException && error.name === "AbortError") {
          logger.info("generation", "Request aborted by user");
          trackMetric({
            kind: "generation_failure",
            durationMs: endTimer(),
            success: false,
            meta: { code: "user_aborted" },
          });
          return;
        }

        const userError =
          error instanceof GenerationError
            ? error.userError
            : classifyGenerationError(error);

        logFullGenerationError(error, {
          promptPreview: prompt.slice(0, 200),
          model,
          requestBody,
        });

        logger.error("generation", userError.title, {
          code: userError.code,
          detail: userError.detail,
        });

        onError?.(userError.message, userError.type, undefined, userError);
        onErrorMessage?.(userError.message, "api");

        trackMetric({
          kind: "generation_failure",
          durationMs: endTimer(),
          success: false,
          meta: { code: userError.code },
        });
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
        isGeneratingRef.current = false;
        setIsLoading(false);
        onStreamingChange?.(false);
        onStreamPhaseChange?.("idle");
        onClearPendingMessage?.();
      }
    },
    [isLoading, accessToken],
  );

  const abortActiveRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isLoading,
    runGeneration,
    abortActiveRequest,
  };
}
