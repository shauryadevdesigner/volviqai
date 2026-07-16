// ============================================================================
// AI Unified Provider Layer (OpenRouter)
// ============================================================================
//
// High-level `generateContent()` function. All AI generation flows through this module.
// ============================================================================

import { GenerateObjectResult, StreamTextResult } from "ai";
import { OpenRouterProvider } from "./openrouter-provider";
import { getModelChain, getModelFallbackChain, getModelForTask } from "./model-router";
import { usageStore } from "./usage-store";
import { logger } from "../lib/logger";
import type { TaskType } from "./types";

const aiProvider = new OpenRouterProvider();

// ── Request Queue System ───────────────────────────────────────────────────

class TaskQueue {
  private activeCount = 0;
  private queue: (() => Promise<void>)[] = [];
  private concurrency: number;

  constructor(concurrency = 5) {
    this.concurrency = concurrency;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        this.activeCount++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.next();
        }
      };

      this.queue.push(task);
      this.next();
    });
  }

  private next() {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }
    const task = this.queue.shift();
    if (task) {
      task();
    }
  }
}

const generationQueue = new TaskQueue(5);

// ── Default Models ──────────────────────────────────────────────────────────

/** Primary model for fast operations (validation, skill detection, etc.) */
export const PRIMARY_MODEL = "gemini-3-flash";

/** Fallback model for fast operations */
export const FALLBACK_MODEL = "gpt-5-mini";

/** Final fallback for critical operations */
export const FINAL_FALLBACK_MODEL = "gpt-oss-120b";

// ── Types ───────────────────────────────────────────────────────────────────

export interface GenerateContentParams {
  provider?: string; // Kept for API compat, always uses OpenRouter
  model: string;
  prompt?: string;
  system?: string;
  messages?: any[];
  schema?: any;    // If provided, performs generateObject
  stream?: boolean; // If true, performs streamText
  taskType?: TaskType; // Optional task type for model chain routing
}

// ── Overloaded Signatures ───────────────────────────────────────────────────

export function generateContent<T = any>(
  params: GenerateContentParams & { schema: any },
): Promise<GenerateObjectResult<T>>;

export function generateContent(
  params: GenerateContentParams & { stream: true },
): Promise<StreamTextResult<any, any>>;

export function generateContent(
  params: GenerateContentParams,
): Promise<any>;

// ── Implementation ──────────────────────────────────────────────────────────

/**
 * High-level generateContent function for the Volviq AI pipeline.
 *
 * Automatically wraps structured object generation, streaming, and
 * text generation with a model fallback chain powered by OpenRouter.
 */
export async function generateContent(params: GenerateContentParams): Promise<any> {
  const queueStart = Date.now();
  return generationQueue.add(async () => {
    const queueTimeMs = Date.now() - queueStart;
    logger.info(`Request entered queue. Queue wait time: ${queueTimeMs}ms`);

    const {
      model: requestedModel,
      prompt,
      system,
      messages,
      schema,
      stream,
      taskType,
    } = params;

    // Build a model chain: start with the requested model, follow its fallback chain,
    // and then append the task-based routing chain
    let chain: string[];
    if (taskType) {
      // Use the fallback chain of the requested model first (if it's registered)
      const requestedChain = requestedModel 
        ? getModelFallbackChain(requestedModel as any) 
        : [];
      
      const taskChain = getModelChain(taskType);
      
      chain = [...requestedChain];
      for (const fallback of taskChain) {
        if (!chain.includes(fallback)) {
          chain.push(fallback);
        }
      }
    } else {
      // Default chain: requested model fallback chain → primary → fallback → final
      const requestedChain = requestedModel 
        ? getModelFallbackChain(requestedModel as any) 
        : [];
      
      chain = [...requestedChain];
      for (const fallback of [PRIMARY_MODEL, FALLBACK_MODEL, FINAL_FALLBACK_MODEL]) {
        if (!chain.includes(fallback)) {
          chain.push(fallback);
        }
      }
    }

    let lastError: any = null;

    for (let i = 0; i < chain.length; i++) {
      const modelName = chain[i];
      const phase = i === 0 ? "primary" : i === 1 ? "fallback" : "final_fallback";

      logger.logModelSelection(modelName, phase);

      try {
        const start = Date.now();

        if (schema) {
          // Structured JSON mode via generateObject
          try {
            const result = await aiProvider.generateObject({
              model: modelName,
              system,
              prompt,
              messages,
              schema,
            });
            const duration = Date.now() - start;
            logger.info(`generateContent (Object) succeeded with ${modelName} in ${duration}ms (Queue wait: ${queueTimeMs}ms)`);

            // Track usage
            usageStore.recordRequest({
              model: modelName,
              taskType: taskType || "generate_object",
              latencyMs: duration,
              promptTokens: (result as any).usage?.promptTokens ?? 0,
              completionTokens: (result as any).usage?.completionTokens ?? 0,
              totalTokens: (result as any).usage?.totalTokens ?? 0,
              success: true,
            });

            return result;
          } catch (err: any) {
            logger.error(`generateContent (Object) failed with model ${modelName}. Attempting JSON repair...`, err);
            const rawText = err.text || (err.cause && err.cause.text) || "";
            if (rawText) {
              try {
                const repairModelId = getModelForTask("validation").id;
                const repairResult = await aiProvider.generateObject({
                  model: repairModelId,
                  system: "Convert the following output into valid JSON matching the required schema exactly.",
                  prompt: `Raw Output:\n${rawText}\n\nSchema details:\n${JSON.stringify(schema)}`,
                  schema,
                });
                const repairDuration = Date.now() - start;
                logger.info(`JSON repair succeeded using ${repairModelId} in ${repairDuration}ms`);

                usageStore.recordRequest({
                  model: repairModelId,
                  taskType: "json_repair",
                  latencyMs: repairDuration,
                  promptTokens: (repairResult as any).usage?.promptTokens ?? 0,
                  completionTokens: (repairResult as any).usage?.completionTokens ?? 0,
                  totalTokens: (repairResult as any).usage?.totalTokens ?? 0,
                  success: true,
                });

                return repairResult;
              } catch (repairError) {
                logger.error("JSON repair failed:", repairError);
              }
            }
            throw err;
          }
        } else if (stream) {
          // Streaming text mode — needs high token limit for full Remotion components
          const result = await aiProvider.streamText({
            model: modelName,
            system,
            prompt,
            messages,
          });
          const duration = Date.now() - start;
          logger.info(`generateContent (Stream) initialized with ${modelName} in ${duration}ms (Queue wait: ${queueTimeMs}ms)`);

          // Track usage (partial — full tracking happens when stream completes)
          usageStore.recordRequest({
            model: modelName,
            taskType: taskType || "stream_text",
            latencyMs: duration,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            success: true,
          });

          return result;
        } else {
          // Non-streaming text mode — not currently supported in the Volviq pipeline
          throw new Error("Only streaming or structured schema mode is currently supported in Volviq pipeline.");
        }
      } catch (error: any) {
        lastError = error;
        logger.warn(`generateContent failed with model ${modelName}: ${error.message || error}`);
        logger.logFailure(phase, `Failed to generate content with ${modelName}`, error.message || error);

        if (i < chain.length - 1) {
          logger.warn(`Attempting fallback to ${chain[i + 1]}...`);
        }
      }
    }

    logger.error("generateContent failed for all models in the fallback chain");
    throw lastError || new Error("AI Generation failed with all models in the fallback chain");
  });
}
