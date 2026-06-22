export const MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Fast)" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash (Fast)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating" | "briefing" | "evaluating" | "refining" | "analyzing" | "strategizing" | "auditing";

export type GenerationErrorType = "validation" | "api";

export const DEFAULT_MODEL_ID: ModelId = "gemini-3.5-flash";
