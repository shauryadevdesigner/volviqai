export const MODELS = [
  { id: "gemini-3-flash", name: "Gemini 3 Flash (Fast & Stable)" },
  { id: "gpt-5-mini", name: "GPT-5 Mini (High Quality)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating" | "briefing" | "evaluating" | "refining" | "analyzing" | "strategizing" | "auditing";

export type GenerationErrorType = "validation" | "api";

export const DEFAULT_MODEL_ID: ModelId = "gemini-3-flash";
