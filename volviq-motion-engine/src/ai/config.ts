// ============================================================================
// AI Configuration — Gemini routing
// ============================================================================
// Lightweight planning, validation, audit, and repair use Llama 3.1 8B.
// Primary Remotion code generation uses the code model selected in the UI.
// GEMINI_MODEL_FAST and GEMINI_MODEL_CODING may override the defaults server-side.
// ============================================================================

export interface ModelSetting {
  id: string; // The active Gemini model identifier
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

const FAST_MODEL = process.env.GEMINI_MODEL_FAST || "gemini-3.6-flash";
const CODING_MODEL = process.env.GEMINI_MODEL_CODING || "gemini-3.6-flash";
const REASONING_MODEL = FAST_MODEL;
const GENERAL_MODEL = FAST_MODEL;
const ADVANCED_MODEL = FAST_MODEL;

export const AI_CONFIG = {
  // Provider settings
  defaultProvider: "gemini",
  defaultModel: "gemini-3.6-flash",
  fallbackModel: "gemini-3.6-flash",
  finalFallbackModel: "gemini-3.1-pro-preview",

  // Legacy internal routing keys remain for compatibility, but resolve to
  // the Gemini tiers above.
  models: {
    "gemini-3.6-flash": { id: "gemini-3.6-flash", temperature: 0.25, maxTokens: 8000, timeoutMs: 90000 },
    "antigravity-preview-05-2026": { id: "antigravity-preview-05-2026", temperature: 0.2, maxTokens: 12000, timeoutMs: 300000 },
    "gemini-3.1-pro-preview": { id: "gemini-3.1-pro-preview", temperature: 0.25, maxTokens: 5000, timeoutMs: 120000 },
    // Compatibility aliases resolve to Gemini; no Groq endpoint is used.
    "llama-3.1-8b-instant": { id: FAST_MODEL, temperature: 0.2, maxTokens: 4000, timeoutMs: 60000 },
    "llama-3.3-70b-versatile": { id: FAST_MODEL, temperature: 0.3, maxTokens: 4500, timeoutMs: 90000 },
    "openai/gpt-oss-120b": { id: CODING_MODEL, temperature: 0.25, maxTokens: 8000, timeoutMs: 90000 },
    "openai/gpt-oss-20b": { id: "antigravity-preview-05-2026", temperature: 0.2, maxTokens: 12000, timeoutMs: 300000 },
    // ── Reasoning Models ──────────────────────────────────────────────────
    "deepseek-v4-pro": { id: REASONING_MODEL, temperature: 0.6, maxTokens: 8000, timeoutMs: 90000 },
    "deepseek-v3.1": { id: REASONING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },
    "deepseek-v3.2": { id: REASONING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },
    "kimi-k2.6": { id: REASONING_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },
    "qwen3-next-80b-a3b-instruct": { id: REASONING_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },
    "qwen3-235b": { id: REASONING_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 90000 },
    "nemotron-3-super-120b-a12b": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 90000 },
    "minimax-m2.7": { id: REASONING_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },
    "minimax-m2.1": { id: REASONING_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },

    // ── Coding Models ─────────────────────────────────────────────────────
    "qwen3-coder-plus": { id: CODING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },
    "qwen3-coder-480b": { id: CODING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },
    "gemma-4-31b-it": { id: CODING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },
    "gemma-4-26b-a4b-it": { id: CODING_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 60000 },

    // ── Fast Models ───────────────────────────────────────────────────────
    "deepseek-v4-flash": { id: FAST_MODEL, temperature: 0.2, maxTokens: 4000, timeoutMs: 60000 },
    "glm-4.7-flash": { id: FAST_MODEL, temperature: 0.2, maxTokens: 4000, timeoutMs: 60000 },
    "glm-4.7": { id: FAST_MODEL, temperature: 0.2, maxTokens: 4000, timeoutMs: 60000 },
    "gpt-5-nano": { id: FAST_MODEL, temperature: 0.3, maxTokens: 4000, timeoutMs: 60000 },
    "gpt-5-mini": { id: FAST_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 90000 },
    "gemini-3-flash": { id: FAST_MODEL, temperature: 0.2, maxTokens: 8000, timeoutMs: 90000 },
    "mimo-v2-flash": { id: FAST_MODEL, temperature: 0.3, maxTokens: 4000, timeoutMs: 60000 },

    // ── General Purpose ───────────────────────────────────────────────────
    "gpt-5": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 60000 },
    "gpt-5.2": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 60000 },
    "gpt-5.5": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 60000 },
    "gpt-oss-120b": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 90000 },
    "llama-3.3-70b-instruct": { id: GENERAL_MODEL, temperature: 0.4, maxTokens: 8000, timeoutMs: 90000 },
    "mistral-medium-latest": { id: GENERAL_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },
    "gemini-3.1-pro": { id: GENERAL_MODEL, temperature: 0.3, maxTokens: 8000, timeoutMs: 60000 },

    // ── Advanced Reasoning & Creative ─────────────────────────────────────
    "claude-opus-4.5": { id: ADVANCED_MODEL, temperature: 0.5, maxTokens: 8000, timeoutMs: 90000 },
    "claude-opus-4.8": { id: ADVANCED_MODEL, temperature: 0.5, maxTokens: 8000, timeoutMs: 90000 },
  } as Record<string, ModelSetting>,
};
