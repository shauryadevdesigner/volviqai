export const MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash — Code Only" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro — Best Quality" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

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
