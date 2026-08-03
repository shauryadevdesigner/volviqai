/** Technical minimum accepted by Remotion. */
export const MIN_DURATION_FRAMES = 1;

/** Used only when neither the prompt nor the UI specifies a duration. */
export const DEFAULT_DURATION_FRAMES = 300;

/** Long-form content target range (20–30s @ 30fps) */
export const LONG_FORM_DURATION_MIN = 600;
export const LONG_FORM_DURATION_MAX = 900;
export const LONG_FORM_DURATION_DEFAULT = 750;

export const DEFAULT_FPS = 100;
export const PREMIUM_FPS = 100;

const LONG_FORM_PATTERN =
  /\b(article|long[\s-]?form|explainer|documentary|storytelling|narration|podcast|tutorial|blog|essay|deep[\s-]?dive|case study|whitepaper|webinar)\b/i;

/**
 * Resolves composition duration from an explicit value and/or prompt content.
 */
export function resolveDurationInFrames(
  options: {
    prompt?: string;
    explicit?: number;
    fps?: number;
  } = {},
): number {
  const { prompt = "", explicit, fps = 30 } = options;

  const secondsMatch = prompt.match(
    /\b(\d+(?:\.\d+)?)\s*(?:-|\s)?(?:seconds?|secs?|sec|s)\b/i,
  );
  const minutesMatch = prompt.match(
    /\b(\d+(?:\.\d+)?)\s*(?:-|\s)?(?:minutes?|mins?|min)\b/i,
  );
  const framesMatch = prompt.match(/\b(\d+)\s*(?:-|\s)?frames?\b/i);

  if (framesMatch) {
    return Math.max(MIN_DURATION_FRAMES, Math.round(Number(framesMatch[1])));
  }
  if (secondsMatch) {
    return Math.max(MIN_DURATION_FRAMES, Math.round(Number(secondsMatch[1]) * fps));
  }
  if (minutesMatch) {
    return Math.max(MIN_DURATION_FRAMES, Math.round(Number(minutesMatch[1]) * 60 * fps));
  }

  if (prompt && LONG_FORM_PATTERN.test(prompt)) {
    if (
      explicit !== undefined &&
      explicit >= LONG_FORM_DURATION_MIN &&
      explicit <= LONG_FORM_DURATION_MAX
    ) {
      return explicit;
    }
    return LONG_FORM_DURATION_DEFAULT;
  }

  if (explicit !== undefined && explicit > 0) {
    return Math.max(MIN_DURATION_FRAMES, explicit);
  }

  return DEFAULT_DURATION_FRAMES;
}

export function clampDurationInFrames(durationInFrames: number): number {
  if (!Number.isFinite(durationInFrames) || durationInFrames < MIN_DURATION_FRAMES) {
    return DEFAULT_DURATION_FRAMES;
  }
  return Math.round(durationInFrames);
}

export function resolveFps(
  explicitFps: number | undefined,
  planTier?: "free" | "pro" | "business",
): number {
  if (explicitFps && explicitFps > 0) {
    return explicitFps;
  }
  return planTier === "business" ? PREMIUM_FPS : DEFAULT_FPS;
}

export function isLongFormPrompt(prompt: string): boolean {
  return LONG_FORM_PATTERN.test(prompt);
}
