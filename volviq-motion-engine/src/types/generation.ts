export const MODELS = [
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash (Fast)" },
  { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus (High Quality)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating" | "briefing" | "evaluating" | "refining" | "analyzing" | "strategizing" | "auditing";

export type GenerationErrorType = "validation" | "api";

export const DEFAULT_MODEL_ID: ModelId = "deepseek-v4-flash";
