import {detectSkillsLocally} from "../../skills";
import {logger} from "../../lib/logger";
import {startTimer} from "../../lib/monitoring";
import {runStage8Unified} from "./stages/stage8-engineer";
import {runStage9} from "./stages/stage9-validate";
import {runStage12} from "./stages/stage12-compile";

export interface OrchestratorParams {
  prompt: string;
  model: string;
  onEvent: (event: Record<string, unknown>) => void;
  userId?: string;
  images?: string[];
}

/** Creates one AI-generated Remotion draft, then validates and compiles it locally. */
export async function runOrchestrator(params: OrchestratorParams): Promise<string> {
  const {prompt, model, onEvent, userId, images = []} = params;
  const runId = Math.random().toString(36).slice(2, 10);
  const elapsed = startTimer();

  logger.info(`[Orchestrator:${runId}] Draft generation started`, {
    model,
    userId,
    imageCount: images.length,
    promptPreview: prompt.slice(0, 120),
  });

  const skills = detectSkillsLocally(prompt);
  onEvent({type: "metadata", skills});
  onEvent({type: "reasoning-start", phase: "generating_draft"});

  const draft = await runStage8Unified({prompt, codeModel: model, images});
  const validated = runStage9(draft).fixedCode;
  const compile = runStage12(validated);
  if (!compile.success) {
    logger.error(`[Orchestrator:${runId}] Generated draft did not compile`, {
      errors: compile.errors,
      codePreview: validated.slice(0, 500),
    });
    throw new Error(`Generated Remotion draft failed compilation: ${compile.errors.join("; ")}`);
  }

  onEvent({
    type: "telemetry",
    data: {
      prompt,
      template: "ai-generated",
      colorPalette: "prompt-directed",
      auditorScore: 0,
      generationDurationMs: elapsed(),
      compileScore: 100,
      refinementCount: 0,
      renderDurationMs: 0,
      userId,
      runId,
      draftModel: model,
      qualityStatus: "text_code_only",
    },
  });
  logger.info(`[Orchestrator:${runId}] Draft generation completed`, {
    model,
    compileScore: 100,
    durationMs: elapsed(),
  });
  return validated;
}
