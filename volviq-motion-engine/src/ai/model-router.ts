// ============================================================================
// Qevaro AI — Dynamic Model Router
// ============================================================================

import type { ModelConfig, QevaroModel, TaskType } from "./types";

/**
 * Complete registry of all available Qevaro models.
 */
export const MODEL_REGISTRY: Record<QevaroModel, ModelConfig> = {
  // ── Reasoning Models ──────────────────────────────────────────────────
  "deepseek-v4-pro": {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "kimi-k2.6",
  },
  "deepseek-v3.1": {
    id: "deepseek-v3.1",
    name: "DeepSeek V3.1",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "kimi-k2.6",
  },
  "kimi-k2.6": {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    category: "qa",
    maxTokens: 8000,
    fallback: "gpt-oss-120b",
  },
  "qwen3-next-80b-a3b-instruct": {
    id: "qwen3-next-80b-a3b-instruct",
    name: "Qwen3 Next 80B",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "gpt-oss-120b",
  },
  "nemotron-3-super-120b-a12b": {
    id: "nemotron-3-super-120b-a12b",
    name: "Nemotron 3 Super 120B",
    category: "general",
    maxTokens: 8000,
  },
  "minimax-m2.7": {
    id: "minimax-m2.7",
    name: "MiniMax M2.7",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "kimi-k2.6",
  },

  // ── Coding Models ─────────────────────────────────────────────────────
  "qwen3-coder-plus": {
    id: "qwen3-coder-plus",
    name: "Qwen3 Coder Plus",
    category: "coding",
    maxTokens: 8000,
    fallback: "gemma-4-31b-it",
  },
  "qwen3-coder-480b": {
    id: "qwen3-coder-480b",
    name: "Qwen3 Coder 480B",
    category: "coding",
    maxTokens: 8000,
    fallback: "gemma-4-31b-it",
  },
  "gemma-4-31b-it": {
    id: "gemma-4-31b-it",
    name: "Gemma 4 31B IT",
    category: "coding",
    maxTokens: 8000,
    fallback: "gemma-4-26b-a4b-it",
  },
  "gemma-4-26b-a4b-it": {
    id: "gemma-4-26b-a4b-it",
    name: "Gemma 4 26B A4B IT",
    category: "coding",
    maxTokens: 8000,
    fallback: "gpt-oss-120b",
  },

  // ── Fast Models ───────────────────────────────────────────────────────
  "gemini-3.5-flash": {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "gemini-3-flash",
  },
  "gemini-3-flash": {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    category: "fast",
    maxTokens: 4000,
  },
  "gemini-2.5-flash-lite": {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    category: "fast",
    maxTokens: 4000,
    fallback: "glm-4.7-flash",
  },
  "deepseek-v4-flash": {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "glm-4.7-flash",
  },
  "glm-4.7-flash": {
    id: "glm-4.7-flash",
    name: "GLM 4.7 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "gpt-5-nano",
  },
  "gpt-5-nano": {
    id: "gpt-5-nano",
    name: "GPT-5 Nano",
    category: "fast",
    maxTokens: 4000,
    fallback: "gpt-oss-120b",
  },

  // ── General Purpose ───────────────────────────────────────────────────
  "gpt-5": {
    id: "gpt-5",
    name: "GPT-5",
    category: "general",
    maxTokens: 8000,
    fallback: "gpt-5-nano",
  },
  "gpt-oss-120b": {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    category: "general",
    maxTokens: 8000,
    fallback: "llama-3.3-70b-instruct",
  },
  "llama-3.3-70b-instruct": {
    id: "llama-3.3-70b-instruct",
    name: "LLaMA 3.3 70B Instruct",
    category: "general",
    maxTokens: 8000,
    fallback: "nemotron-3-super-120b-a12b",
  },
  "mistral-medium-latest": {
    id: "mistral-medium-latest",
    name: "Mistral Medium",
    category: "general",
    maxTokens: 8000,
    fallback: "gpt-oss-120b",
  },

  // ── Future (Locked) ───────────────────────────────────────────────────
  "claude-opus-4.8": {
    id: "claude-opus-4.8",
    name: "Claude Opus 4.8",
    category: "future",
    maxTokens: 8000,
    locked: true,
  },
};

/**
 * Task → Model routing table.
 *
 * Each task type maps to a primary model and an implicit fallback chain
 * derived from the model's `fallback` field in the registry.
 */
const TASK_MODEL_MAP: Record<TaskType, QevaroModel> = {
  storyboarding: "gemini-3.5-flash",
  remotion_generation: "gemini-3.5-flash",
  fast_operation: "gemini-3.5-flash",
  quality_assurance: "gemini-3.5-flash",
  validation: "gemini-3.5-flash",
  skill_detection: "gemini-3.5-flash",
  image_generation: "gemini-3.5-flash", // Placeholder for future
  vision_analysis: "gemini-3.5-flash", // Placeholder for future
};

/**
 * Returns the model configuration for a given task type.
 */
export function getModelForTask(task: TaskType): ModelConfig {
  const modelId = TASK_MODEL_MAP[task];
  const config = MODEL_REGISTRY[modelId];
  if (!config) {
    throw new Error(`No model registered for task: ${task}`);
  }
  return config;
}

/**
 * Returns the full fallback chain for a given task type.
 *
 * e.g. for `storyboarding`: ["deepseek-v4-pro", "deepseek-v3.1", "kimi-k2.6"]
 */
export function getModelChain(task: TaskType): QevaroModel[] {
  const primaryId = TASK_MODEL_MAP[task];
  const chain: QevaroModel[] = [primaryId];

  let current = MODEL_REGISTRY[primaryId];
  while (current?.fallback) {
    const fallbackConfig = MODEL_REGISTRY[current.fallback];
    if (!fallbackConfig || chain.includes(fallbackConfig.id)) break;
    chain.push(fallbackConfig.id);
    current = fallbackConfig;
  }

  return chain;
}

/**
 * Returns the full fallback chain starting from a given model ID.
 */
export function getModelFallbackChain(modelId: QevaroModel): QevaroModel[] {
  const chain: QevaroModel[] = [modelId];

  let current = MODEL_REGISTRY[modelId];
  while (current?.fallback) {
    const fallbackConfig = MODEL_REGISTRY[current.fallback];
    if (!fallbackConfig || chain.includes(fallbackConfig.id)) break;
    chain.push(fallbackConfig.id);
    current = fallbackConfig;
  }

  return chain;
}

/**
 * Returns all registered models (for the dashboard).
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(MODEL_REGISTRY);
}

/**
 * Check if a specific model is currently available (not locked).
 */
export function isModelAvailable(model: QevaroModel): boolean {
  const config = MODEL_REGISTRY[model];
  return config ? !config.locked : false;
}

/**
 * Returns the ModelConfig for a specific model ID, or null if not found.
 */
export function getModelConfig(model: QevaroModel | string): ModelConfig | null {
  return MODEL_REGISTRY[model as QevaroModel] ?? null;
}
