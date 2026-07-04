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
    fallback: "claude-opus-4.5",
  },
  "deepseek-v3.1": {
    id: "deepseek-v3.1",
    name: "DeepSeek V3.1",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "kimi-k2.6",
  },
  "deepseek-v3.2": {
    id: "deepseek-v3.2",
    name: "DeepSeek V3.2",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "deepseek-v3.1",
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
  "qwen3-235b": {
    id: "qwen3-235b",
    name: "Qwen3 235B",
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
  "minimax-m2.1": {
    id: "minimax-m2.1",
    name: "MiniMax M2.1",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "minimax-m2.7",
  },

  // ── Coding Models ─────────────────────────────────────────────────────
  "qwen3-coder-plus": {
    id: "qwen3-coder-plus",
    name: "Qwen3 Coder Plus",
    category: "coding",
    maxTokens: 8000,
    fallback: "claude-opus-4.5",
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
  "deepseek-v4-flash": {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "gemini-3-flash",
  },
  "gemini-3-flash": {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    category: "fast",
    maxTokens: 8000,
    fallback: "gpt-5-mini",
  },
  "gpt-5-mini": {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    category: "fast",
    maxTokens: 8000,
    fallback: "glm-4.7-flash",
  },
  "glm-4.7-flash": {
    id: "glm-4.7-flash",
    name: "GLM 4.7 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "gpt-5-nano",
  },
  "glm-4.7": {
    id: "glm-4.7",
    name: "GLM 4.7",
    category: "fast",
    maxTokens: 4000,
    fallback: "gpt-5-nano",
  },
  "gpt-5-nano": {
    id: "gpt-5-nano",
    name: "GPT-5 Nano",
    category: "fast",
    maxTokens: 4000,
    fallback: "mimo-v2-flash",
  },
  "mimo-v2-flash": {
    id: "mimo-v2-flash",
    name: "Mimo V2 Flash",
    category: "fast",
    maxTokens: 4000,
    fallback: "gpt-oss-120b",
  },

  // ── General Purpose ───────────────────────────────────────────────────
  "gpt-5.5": {
    id: "gpt-5.5",
    name: "GPT-5.5",
    category: "general",
    maxTokens: 8000,
    fallback: "gpt-5.2",
  },
  "gpt-5.2": {
    id: "gpt-5.2",
    name: "GPT-5.2",
    category: "general",
    maxTokens: 8000,
    fallback: "gpt-5",
  },
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
  "gemini-3.1-pro": {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    category: "general",
    maxTokens: 8000,
    fallback: "gpt-oss-120b",
  },

  // ── Advanced Reasoning & Creative ─────────────────────────────────────
  "claude-opus-4.5": {
    id: "claude-opus-4.5",
    name: "Claude Opus 4.5",
    category: "reasoning",
    maxTokens: 8000,
    fallback: "gpt-5.5",
  },
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
  storyboarding: "claude-opus-4.5",
  remotion_generation: "gemini-3-flash",
  fast_operation: "gemini-3-flash",
  quality_assurance: "claude-opus-4.5",
  validation: "gemini-3-flash",
  skill_detection: "gemini-3-flash",
  image_generation: "gemini-3-flash", // Placeholder for future
  vision_analysis: "gemini-3-flash", // Placeholder for future
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
