// ============================================================================
// AI Configuration — Central Registry for OpenRouter Model Settings
// ============================================================================

export interface ModelSetting {
  id: string; // The active OpenRouter model identifier
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export const AI_CONFIG = {
  // Provider settings
  defaultProvider: "openrouter",
  defaultModel: "gemini-3-flash",
  fallbackModel: "gpt-5-mini",
  finalFallbackModel: "gpt-oss-120b",

  // Central model configurations mapped from internal registry IDs
  models: {
    // ── Reasoning Models ──────────────────────────────────────────────────
    "deepseek-v4-pro": {
      id: "deepseek/deepseek-r1",
      temperature: 0.6,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "deepseek-v3.1": {
      id: "deepseek/deepseek-chat",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "deepseek-v3.2": {
      id: "deepseek/deepseek-chat",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "kimi-k2.6": {
      id: "google/gemini-2.5-flash", // fall back to reliable flash on OpenRouter if moonshot isn't available
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "qwen3-next-80b-a3b-instruct": {
      id: "qwen/qwen-2.5-72b-instruct",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "qwen3-235b": {
      id: "qwen/qwen-2.5-72b-instruct",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "nemotron-3-super-120b-a12b": {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "minimax-m2.7": {
      id: "minimax/minimax-01",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "minimax-m2.1": {
      id: "minimax/minimax-01",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },

    // ── Coding Models ─────────────────────────────────────────────────────
    "qwen3-coder-plus": {
      id: "qwen/qwen-2.5-coder-32b-instruct",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "qwen3-coder-480b": {
      id: "qwen/qwen-2.5-coder-32b-instruct",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gemma-4-31b-it": {
      id: "google/gemma-2-27b-it",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gemma-4-26b-a4b-it": {
      id: "google/gemma-2-27b-it",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },

    // ── Fast Models ───────────────────────────────────────────────────────
    "deepseek-v4-flash": {
      id: "deepseek/deepseek-chat",
      temperature: 0.2,
      maxTokens: 4000,
      timeoutMs: 60000,
    },
    "glm-4.7-flash": {
      id: "google/gemini-2.5-flash",
      temperature: 0.2,
      maxTokens: 4000,
      timeoutMs: 60000,
    },
    "glm-4.7": {
      id: "google/gemini-2.5-flash",
      temperature: 0.2,
      maxTokens: 4000,
      timeoutMs: 60000,
    },
    "gpt-5-nano": {
      id: "openai/gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 4000,
      timeoutMs: 60000,
    },
    "gpt-5-mini": {
      id: "openai/gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gemini-3-flash": {
      id: "google/gemini-2.5-flash",
      temperature: 0.2,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "mimo-v2-flash": {
      id: "openai/gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 4000,
      timeoutMs: 60000,
    },

    // ── General Purpose ───────────────────────────────────────────────────
    "gpt-5": {
      id: "openai/gpt-4o",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gpt-5.2": {
      id: "openai/gpt-4o",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gpt-5.5": {
      id: "openai/gpt-4o",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gpt-oss-120b": {
      id: "meta-llama/llama-3.3-70b-instruct",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "llama-3.3-70b-instruct": {
      id: "meta-llama/llama-3.3-70b-instruct",
      temperature: 0.4,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "mistral-medium-latest": {
      id: "mistralai/mistral-large",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },
    "gemini-3.1-pro": {
      id: "google/gemini-2.5-pro",
      temperature: 0.3,
      maxTokens: 8000,
      timeoutMs: 60000,
    },

    // ── Advanced Reasoning & Creative ─────────────────────────────────────
    "claude-opus-4.5": {
      id: "anthropic/claude-3-opus",
      temperature: 0.5,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
    "claude-opus-4.8": {
      id: "anthropic/claude-3-opus",
      temperature: 0.5,
      maxTokens: 8000,
      timeoutMs: 90000,
    },
  } as Record<string, ModelSetting>,
};
