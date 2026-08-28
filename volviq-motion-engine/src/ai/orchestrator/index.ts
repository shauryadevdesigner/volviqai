import {detectSkillsLocally, getCombinedSkillContent} from "../../skills";
import {logger} from "../../lib/logger";
import {startTimer} from "../../lib/monitoring";
import {runStage8Unified} from "./stages/stage8-engineer";
import {runStage9} from "./stages/stage9-validate";
import {runStage12} from "./stages/stage12-compile";
import type {GenerationMode} from "../../types/generation";
import {findUndefinedIdentifiers} from "../../remotion/jsx-validator";
import {findSimilarTemplate} from "../template-cache";
import {enhanceVisuals, meetsQualityThreshold} from "../../remotion/visual-enhancer";

export interface OrchestratorParams {
  prompt: string;
  model: string;
  onEvent: (event: Record<string, unknown>) => void;
  userId?: string;
  images?: string[];
  generationMode: GenerationMode;
  fps: number;
  durationInFrames: number;
}

const MAX_REPAIR_ATTEMPTS = 3;

/** Creates one AI-generated Remotion draft, then validates and compiles it locally. */
export async function runOrchestrator(params: OrchestratorParams): Promise<string> {
  const {prompt, model, onEvent, userId, images = [], generationMode, fps, durationInFrames} = params;
  const runId = Math.random().toString(36).slice(2, 10);
  const elapsed = startTimer();

  logger.info(`[Orchestrator:${runId}] Draft generation started`, {
    model,
    userId,
    imageCount: images.length,
    generationMode,
    fps,
    durationInFrames,
    promptPreview: prompt.slice(0, 120),
  });

  const skills = detectSkillsLocally(prompt);
  // Ensure ad mode always has core ad skills included
  if (generationMode === "ad") {
    if (!skills.includes("cinematic-ad")) skills.push("cinematic-ad");
    if (!skills.includes("lighting-composition")) skills.push("lighting-composition");
    if (!skills.includes("typography")) skills.push("typography");
    if (!skills.includes("spring-physics")) skills.push("spring-physics");
  }

  const skillContent = getCombinedSkillContent(skills);
  onEvent({type: "metadata", skills});
  onEvent({type: "reasoning-start", phase: "generating_draft"});

  // Check template cache for similar successful generations
  const similarTemplate = await findSimilarTemplate(prompt, generationMode);
  let enrichedPrompt = prompt;
  if (similarTemplate && similarTemplate.auditor_score >= 85) {
    logger.info(`[Orchestrator:${runId}] Found similar template in cache (score: ${similarTemplate.auditor_score}). Using as reference.`);
    enrichedPrompt = `${prompt}\n\n--- REFERENCE STYLE ---\nA successful similar generation used this approach:\nColor palette: ${similarTemplate.color_palette}\nKey patterns: Extract the animation structure from this working example and adapt it to the new prompt.`;
  }

  const generateDraft = (draftPrompt: string, attempt: number) => runStage8Unified({
    prompt: draftPrompt,
    codeModel: model,
    images,
    generationMode,
    fps,
    durationInFrames,
    skillContent,
  });

  let draft = await generateDraft(enrichedPrompt, 0);
  let validated = runStage9(draft).fixedCode;
  let compile = runStage12(validated);
  let refinementCount = 0;

  // Multi-attempt repair loop
  while (!compile.success && refinementCount < MAX_REPAIR_ATTEMPTS) {
    refinementCount++;
    logger.warn(`[Orchestrator:${runId}] Draft failed compilation (attempt ${refinementCount}/${MAX_REPAIR_ATTEMPTS}); repairing`, {
      errors: compile.errors,
      codePreview: validated.slice(0, 300),
    });
    onEvent({
      type: "reasoning-start",
      phase: "refining_animation",
      message: `Repairing the generated Remotion component (attempt ${refinementCount}/${MAX_REPAIR_ATTEMPTS})`,
    });

    // Check for undefined identifiers to include in repair prompt
    const { undefinedRefs } = findUndefinedIdentifiers(validated);
    const undefinedHint = undefinedRefs.length > 0
      ? `\n\nUndefined variables detected: ${undefinedRefs.map(r => r.name).join(", ")}. DEFINE ALL variables before use.`
      : "";

    const repairPrompt = refinementCount <= 2
      ? `${enrichedPrompt}\n\nThe previous AI draft failed compilation: ${compile.errors.join("; ")}. Generate a fresh, concise, COMPLETE TSX module. Finish every expression, JSX element, function, and brace. Declare ALL springs and interpolations as const BEFORE the return statement.${undefinedHint}`
      : `${enrichedPrompt}\n\nCRITICAL: Previous ${refinementCount} attempts failed. Output ONLY the most minimal, working Remotion component. Use ONLY: AbsoluteFill, div, span, spring(), interpolate(), useCurrentFrame(), useVideoConfig(). NO complex components. NO external imports beyond remotion. Declare ALL animation state as const before return.${undefinedHint}`;

    draft = await generateDraft(repairPrompt, refinementCount);
    validated = runStage9(draft).fixedCode;
    compile = runStage12(validated);
  }

  if (!compile.success) {
    logger.error(`[Orchestrator:${runId}] All ${MAX_REPAIR_ATTEMPTS} repair attempts exhausted`, {
      errors: compile.errors,
      codePreview: validated.slice(0, 500),
    });
    throw new Error(`Generated Remotion draft failed compilation after ${MAX_REPAIR_ATTEMPTS} repair attempts: ${compile.errors.join("; ")}`);
  }

  // Post-generation visual enhancement
  const qualityCheck = meetsQualityThreshold(validated);
  if (!qualityCheck.passes) {
    logger.warn(`[Orchestrator:${runId}] Generated code below quality threshold (score: ${qualityCheck.score}/100). Issues: ${qualityCheck.issues.join(", ")}. Enhancing...`);
    onEvent({
      type: "reasoning-start",
      phase: "enhancing_visuals",
      message: "Adding cinematic effects and visual polish",
    });
    validated = enhanceVisuals(validated);
    // Re-validate and compile after enhancement
    validated = runStage9(validated).fixedCode;
    compile = runStage12(validated);
    if (!compile.success) {
      logger.warn(`[Orchestrator:${runId}] Enhanced code failed compilation, using pre-enhancement version`);
      // Revert to pre-enhancement
      validated = runStage9(draft).fixedCode;
      compile = runStage12(validated);
    }
  } else {
    logger.info(`[Orchestrator:${runId}] Generated code passed quality check (score: ${qualityCheck.score}/100)`);
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
      refinementCount,
      renderDurationMs: 0,
      userId,
      runId,
      draftModel: model,
      qualityStatus: "text_code_only",
      generationMode,
      fps,
      durationInFrames,
      loop: generationMode === "motion_asset" || generationMode === "3d",
    },
  });
  logger.info(`[Orchestrator:${runId}] Draft generation completed`, {
    model,
    compileScore: 100,
    durationMs: elapsed(),
    refinementCount,
  });
  return validated;
}
