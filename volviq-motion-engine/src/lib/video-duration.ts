/** Minimum composition length: 10s @ 30fps */
export const MIN_DURATION_FRAMES = 300;

/** Long-form content target range (20–30s @ 30fps) */
export const LONG_FORM_DURATION_MIN = 600;
export const LONG_FORM_DURATION_MAX = 900;
export const LONG_FORM_DURATION_DEFAULT = 750;

export const DEFAULT_FPS = 30;
export const PREMIUM_FPS = 60;

const LONG_FORM_PATTERN =
  /\b(article|long[\s-]?form|explainer|documentary|storytelling|narration|podcast|tutorial|blog|essay|deep[\s-]?dive|case study|whitepaper|webinar)\b/i;

/**
 * Resolves composition duration from an explicit value and/or prompt content.
 */
export function resolveDurationInFrames(
  options: {
    prompt?: string;
    explicit?: number;
  } = {},
): number {
  const { prompt = "", explicit } = options;

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

  return MIN_DURATION_FRAMES;
}

export function clampDurationInFrames(durationInFrames: number): number {
  if (!Number.isFinite(durationInFrames) || durationInFrames < MIN_DURATION_FRAMES) {
    return MIN_DURATION_FRAMES;
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
