// ============================================================================
// Qevaro AI Provider — Shared Types
// ============================================================================

/**
 * All available Qevaro model identifiers.
 */
export type QevaroModel =
  // Reasoning Models
  | "deepseek-v4-pro"
  | "deepseek-v3.1"
  | "kimi-k2.6"
  | "qwen3-next-80b-a3b-instruct"
  | "nemotron-3-super-120b-a12b"
  | "minimax-m2.7"
  // Coding Models
  | "qwen3-coder-plus"
  | "qwen3-coder-480b"
  | "gemma-4-26b-a4b-it"
  | "gemma-4-31b-it"
  // Fast Models
  | "gemini-3.5-flash"
  | "gemini-3-flash"
  | "gemini-2.5-flash-lite"
  | "deepseek-v4-flash"
  | "glm-4.7-flash"
  | "gpt-5-nano"
  // General Purpose
  | "gpt-5"
  | "gpt-oss-120b"
  | "llama-3.3-70b-instruct"
  | "mistral-medium-latest"
  // Future (locked)
  | "claude-opus-4.8";

/**
 * Model category classification for routing and dashboard display.
 */
export type ModelCategory =
  | "reasoning"
  | "coding"
  | "fast"
  | "general"
  | "qa"
  | "future";

/**
 * Per-model configuration entry in the registry.
 */
export interface ModelConfig {
  id: QevaroModel;
  name: string;
  category: ModelCategory;
  maxTokens: number;
  fallback?: QevaroModel;
  locked?: boolean;
}

/**
 * Task types that map to specific models via the model router.
 */
export type TaskType =
  | "storyboarding"
  | "remotion_generation"
  | "fast_operation"
  | "quality_assurance"
  | "validation"
  | "skill_detection"
  | "image_generation"
  | "vision_analysis";

/**
 * Parameters for `createQevaroCompletion()`.
 */
export interface QevaroCompletionParams {
  model: QevaroModel | string;
  messages: QevaroMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  jsonMode?: boolean;
  retries?: number;
  timeoutMs?: number;
}

/**
 * A single message in the Qevaro chat completion request.
 */
export interface QevaroMessage {
  role: "system" | "user" | "assistant";
  content: string | QevaroContentPart[];
}

/**
 * Multi-modal content part (text or image).
 */
export type QevaroContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/**
 * Wrapper around the Qevaro chat completion response.
 */
export interface QevaroCompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  quotaMetrics: QevaroUsageMetrics | null;
  latencyMs: number;
  finishReason: string;
}

/**
 * Token quota metrics extracted from Qevaro response headers.
 */
export interface QevaroUsageMetrics {
  tokenQuotaTotal: number;
  tokenQuotaUsed: number;
  tokenQuotaRemaining: number;
}

/**
 * Structured storyboard scene for the motion graphics pipeline.
 */
export interface StoryboardScene {
  scene: number;
  duration: number;
  visuals: string;
  animation: string;
  text: string;
  camera: string;
}

/**
 * Structured storyboard output from the creative brief pipeline.
 */
export interface StoryboardOutput {
  title: string;
  duration: number;
  style: string;
  scenes: StoryboardScene[];
}

/**
 * Record of a single AI request for usage tracking.
 */
export interface AIRequestRecord {
  id: string;
  model: string;
  taskType: TaskType | string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

/**
 * Aggregated usage metrics for the dashboard.
 */
export interface AggregatedUsageMetrics {
  totalRequests: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
  errorRate: number;
  quota: QevaroUsageMetrics | null;
  modelBreakdown: ModelUsageBreakdown[];
}

/**
 * Per-model usage breakdown for dashboard display.
 */
export interface ModelUsageBreakdown {
  model: string;
  requests: number;
  avgLatencyMs: number;
  totalTokens: number;
  errorCount: number;
  errorRate: number;
}
