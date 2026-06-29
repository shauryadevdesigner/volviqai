import type {
  EditOperation,
  ErrorCorrectionContext,
} from "@/types/conversation";
import { useCallback, useEffect, useRef } from "react";

interface AutoCorrectionConfig {
  maxAttempts: number;
  /** Compilation error from useAnimationState */
  compilationError: string | null;
  /** Generation/API error */
  generationError: {
    message: string;
    type: string;
    failedEdit?: EditOperation;
  } | null;
  /** Whether code is currently being generated */
  isStreaming: boolean;
  /** Whether code is currently being compiled */
  isCompiling: boolean;
  /** Whether any generation has occurred */
  hasGeneratedOnce: boolean;
  /** Current code content */
  code: string;
  /** Current error correction context */
  errorCorrection: ErrorCorrectionContext | null;
  /** The last user prompt that was executed */
  lastPrompt?: string;
  /** Callbacks */
  onTriggerCorrection: (
    prompt: string,
    errorContext: ErrorCorrectionContext,
  ) => void;
  onAddErrorMessage: (
    message: string,
    type: "edit_failed" | "api" | "validation",
    failedEdit?: EditOperation,
  ) => void;
  onClearGenerationError: () => void;
  onClearErrorCorrection: () => void;
}

/**
 * Hook to handle auto-correction of AI-generated code errors.
 * Tracks whether errors are from AI or user edits, and only auto-corrects AI errors.
 */
export function useAutoCorrection({
  maxAttempts,
  compilationError,
  generationError,
  isStreaming,
  isCompiling,
  hasGeneratedOnce,
  code,
  errorCorrection,
  lastPrompt,
  onTriggerCorrection,
  onAddErrorMessage,
  onClearGenerationError,
  onClearErrorCorrection,
}: AutoCorrectionConfig) {
  // Track whether last code change was from AI or user
  const lastChangeSourceRef = useRef<"ai" | "user">("ai");
  // Guard against duplicate correction triggers
  const correctionInProgressRef = useRef(false);

  // Mark code as AI-generated
  const markAsAiGenerated = useCallback(() => {
    lastChangeSourceRef.current = "ai";
  }, []);

  // Mark code as user-edited
  const markAsUserEdited = useCallback(() => {
    lastChangeSourceRef.current = "user";
  }, []);

  // Check if we should attempt auto-correction
  const shouldAutoCorrect = useCallback(() => {
    return (
      hasGeneratedOnce &&
      !isStreaming &&
      lastChangeSourceRef.current === "ai" &&
      (errorCorrection?.attemptNumber ?? 0) < maxAttempts
    );
  }, [hasGeneratedOnce, isStreaming, errorCorrection, maxAttempts]);

  // Handle compilation errors
  useEffect(() => {
    if (
      compilationError &&
      !isCompiling &&
      !generationError &&
      code.trim() &&
      shouldAutoCorrect() &&
      !correctionInProgressRef.current
    ) {
      const nextAttempt = (errorCorrection?.attemptNumber ?? 0) + 1;

      // Hard cap: never exceed 2 auto-correction attempts to prevent 429 rate limits
      const effectiveMaxAttempts = Math.min(maxAttempts, 2);
      if (nextAttempt > effectiveMaxAttempts) {
        console.log(`[AutoCorrection] Max attempts reached (${effectiveMaxAttempts}). Stopping auto-correction.`);
        correctionInProgressRef.current = false;
        return;
      }

      correctionInProgressRef.current = true;
      console.log(
        `Auto-correction attempt ${nextAttempt}/${effectiveMaxAttempts} for compilation error:`,
        compilationError,
      );

      // Add a cooldown delay to prevent rapid-fire API calls
      const cooldownMs = nextAttempt * 2000; // 2s, 4s delay for attempts 1, 2
      setTimeout(() => {
        onAddErrorMessage(`Compilation error: ${compilationError}`, "validation");
        onTriggerCorrection("Fix the compilation error", {
          error: compilationError,
          attemptNumber: nextAttempt,
          maxAttempts: effectiveMaxAttempts,
        });
      }, cooldownMs);
    }

    // Clear error correction state on successful compilation
    if (!compilationError && !isCompiling && errorCorrection) {
      correctionInProgressRef.current = false;
      onClearErrorCorrection();
    }
  }, [
    compilationError,
    isCompiling,
    generationError,
    code,
    errorCorrection,
    maxAttempts,
    shouldAutoCorrect,
    onAddErrorMessage,
    onTriggerCorrection,
    onClearErrorCorrection,
  ]);

  // Handle generation/API errors
  useEffect(() => {
    if (generationError && shouldAutoCorrect() && !correctionInProgressRef.current) {
      const nextAttempt = (errorCorrection?.attemptNumber ?? 0) + 1;

      // Hard cap: never exceed 2 auto-retry attempts
      const effectiveMaxAttempts = Math.min(maxAttempts, 2);
      if (nextAttempt > effectiveMaxAttempts) {
        console.log(`[AutoCorrection] Max retry attempts reached (${effectiveMaxAttempts}). Stopping.`);
        correctionInProgressRef.current = false;
        return;
      }

      correctionInProgressRef.current = true;

      console.log(
        `Auto-retry attempt ${nextAttempt}/${effectiveMaxAttempts} for generation error:`,
        generationError.message,
      );

      // Cooldown delay to prevent rapid-fire API calls
      const cooldownMs = nextAttempt * 2000;
      onClearGenerationError();
      setTimeout(() => {
        onTriggerCorrection(lastPrompt || "Retry the previous request", {
          error: generationError.message,
          attemptNumber: nextAttempt,
          maxAttempts: effectiveMaxAttempts,
          failedEdit: generationError.failedEdit,
        });
      }, cooldownMs);
    }
  }, [
    generationError,
    errorCorrection,
    maxAttempts,
    shouldAutoCorrect,
    onClearGenerationError,
    onTriggerCorrection,
    lastPrompt,
  ]);

  return {
    markAsAiGenerated,
    markAsUserEdited,
  };
}
