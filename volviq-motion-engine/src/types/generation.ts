export const MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash — Best Quality", minTier: "pro" as const },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite — Faster", minTier: "free" as const },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite — Fastest", minTier: "free" as const },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export type PlanTier = "free" | "pro" | "business";

// Helper function to check if a model is available for a plan tier
export function isModelAvailableForTier(modelId: ModelId, userTier: PlanTier): boolean {
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return false;
  
  const tierHierarchy: Record<PlanTier, number> = { free: 0, pro: 1, business: 2 };
  const modelTierLevel = tierHierarchy[model.minTier];
  const userTierLevel = tierHierarchy[userTier];
  
  return userTierLevel >= modelTierLevel;
}

// Get available models for a plan tier
export function getAvailableModelsForTier(userTier: PlanTier) {
  return MODELS.filter(model => isModelAvailableForTier(model.id, userTier));
}

export type GenerationMode = "ad" | "motion_asset" | "3d";

export const GENERATION_MODE_PRESETS: Record<
  GenerationMode,
  { durationInFrames: number; fps: number; loop: boolean }
> = {
  ad: { durationInFrames: 1200, fps: 60, loop: false },
  motion_asset: { durationInFrames: 300, fps: 60, loop: true },
  "3d": { durationInFrames: 600, fps: 60, loop: false },
};

export type StreamPhase =
  | "idle"
  | "reasoning"
  | "generating"
  | "generating_draft"
  | "rendering_quality_frames"
  | "reviewing_visuals"
  | "refining_animation"
  | "compiling_final"
  | "briefing"
  | "evaluating"
  | "refining"
  | "analyzing"
  | "strategizing"
  | "auditing"
  | "asset_planning"
  | "generating_assets"
  | "generating_asset"
  | "generating_scene"
  | "compiling";

export type GenerationErrorType = "validation" | "api";

export const DEFAULT_MODEL_ID: ModelId = "gemini-3.6-flash";


