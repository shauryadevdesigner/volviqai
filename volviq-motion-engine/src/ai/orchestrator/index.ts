import { runStage0 } from "./stages/stage0-intent";
import { runStage1 } from "./stages/stage1-creative";
import { runStage2 } from "./stages/stage2-marketing";
import { runStage3 } from "./stages/stage3-storyboard";
import { runStage4 } from "./stages/stage4-design";
import { runStage5 } from "./stages/stage5-asset-plan";
import { runStage6 } from "./stages/stage6-image-gen";
import { runStage7 } from "./stages/stage7-layout";
import { runStage8Scene, buildUnifiedComposition } from "./stages/stage8-engineer";
import { runStage9 } from "./stages/stage9-validate";
import { runStage10 } from "./stages/stage10-audit";
import { runStage12 } from "./stages/stage12-compile";
import { runStage13 } from "./stages/stage13-repair";
import { readCreativeMemory, saveToCreativeMemory } from "./memory-engine";

import { findSimilarTemplate, saveTemplateToCache } from "../template-cache";
import { getCombinedSkillContent, detectSkillsLocally, type SkillName } from "../../skills";
import { SYSTEM_PROMPT } from "../prompts/generation";
import { startTimer } from "../../lib/monitoring";
import { z } from "zod";
import { generateContent } from "../provider";
import { getModelForTask } from "../model-router";

export interface OrchestratorParams {
  prompt: string;
  model: string;
  onEvent: (event: Record<string, any>) => void;
  userId?: string;
}

export async function runOrchestrator(params: OrchestratorParams): Promise<string> {
  const { prompt, model: modelId, onEvent, userId } = params;
  console.log("[Orchestrator] Running with model:", modelId);
  const generationTimer = startTimer();

  try {
    // ── Phase 0: Intent & Strategy ──

    // Local Skill Detection
    const detectedSkills = detectSkillsLocally(prompt);
    onEvent({ type: "metadata", skills: detectedSkills });

    // Load Skill Content
    const skillContent = getCombinedSkillContent(detectedSkills as SkillName[]);
    const enhancedSystemPrompt = skillContent
      ? `${SYSTEM_PROMPT}\n\n## SKILL-SPECIFIC GUIDANCE\n${skillContent}`
      : SYSTEM_PROMPT;

    // Stage 0: Intent Classifier
    onEvent({ type: "reasoning-start", phase: "analyzing" });
    const intent = await runStage0(prompt);
    console.log("[Orchestrator] Stage 0 Intent:", intent);

    // Stage 1: Creative Brief Planner
    onEvent({ type: "reasoning-start", phase: "strategizing" });
    const creativeBrief = await runStage1(prompt, intent);
    console.log("[Orchestrator] Stage 1 Creative Brief:", creativeBrief);

    // Stage 2: Marketing Strategist
    onEvent({ type: "reasoning-start", phase: "copywriting" });
    const marketingStrategy = await runStage2(creativeBrief, intent);
    console.log("[Orchestrator] Stage 2 Marketing Strategy:", marketingStrategy);

    // Read creative memory for historical examples
    const memory = readCreativeMemory();
    const memoryExamples = memory
      .slice(-3)
      .map(
        (m) => `Prompt: "${m.prompt}"
Audience: ${m.audience}
Emotion: ${m.emotion}
Template: ${m.template || "SaaS Promo"}
Palette: ${m.colorPalette || "Midnight Royal"}
Final Quality Score: ${m.finalScore}/100`,
      )
      .join("\n\n---\n\n");

    // Stage 3: Storyboard Director
    onEvent({ type: "reasoning-start", phase: "storyboarding" });
    const brief = await runStage3(marketingStrategy, intent, memoryExamples);
    console.log("[Orchestrator] Stage 3 Storyboard Brief:", brief);

    // Stream brief headers immediately
    onEvent({ type: "reasoning-start", phase: "briefing" });
    const briefComment = `/*
 * =======================================================================
 *                         VOLVIQ AI CREATIVE BRIEF (V10)
 * =======================================================================
 * TEMPLATE   : ${brief.template}
 * PALETTE    : ${brief.colorPalette}
 * AUDIENCE   : ${brief.audienceProfile?.audience || "General"}
 * EMOTION    : ${brief.strategy?.core_emotion || "Trust"}
 * =======================================================================
 */\n\n`;
    onEvent({ type: "text-start" });
    onEvent({ type: "text-delta", delta: briefComment });

    // ── Phase 1: Planning & Design ──

    // Stage 4: Design System Resolver
    const resolvedBrief = runStage4(brief);
    console.log("[Orchestrator] Stage 4 Design System:", resolvedBrief);

    // Stage 5: Visual Asset Planner
    onEvent({ type: "reasoning-start", phase: "asset_planning" });
    const assetPlan = await runStage5(resolvedBrief);
    console.log("[Orchestrator] Stage 5 Asset Plan:", assetPlan);

    // ── Phase 2: Asset & Layout Assembly ──

    // Stage 6: Image Generation Engine
    onEvent({ type: "reasoning-start", phase: "generating_assets" });
    const assets = await runStage6(assetPlan, (msg) => {
      onEvent({ type: "reasoning-start", phase: "generating_asset", message: msg });
    });
    console.log("[Orchestrator] Stage 6 Generated Assets:", assets);

    // Inject generated image URLs back into resolved brief for final layout rendering
    resolvedBrief.scenes.forEach((scene) => {
      const generated = assets.sceneAssets[scene.sceneNumber];
      if (generated) {
        scene.assetStrategy.imageUrl = generated.imageUrl;
      }
    });

    // Stage 7: Scene Architect
    const sceneLayouts = runStage7(resolvedBrief, assets);
    console.log("[Orchestrator] Stage 7 Scene Layouts:", sceneLayouts);

    // ── Phase 3: Code & Engineering (Refinement Loop) ──
    onEvent({ type: "reasoning-start", phase: "generating" });

    // Lookup Approved Templates Cache
    const cachedTemplate = await findSimilarTemplate(prompt, resolvedBrief.template);

    let totalRefinementAttempts = 0;
    let compileScore = 100;
    let lastCompileErrors: string[] = [];

    // Stage 8: Motion Engineer (run scene-by-scene in parallel with staggering)
    const scenePromises = resolvedBrief.scenes.map(async (scene, index) => {
      // Stagger request starts by 1 second to prevent concurrent rate limits (429) on free keys
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, index * 1000));
      }

      const layout = sceneLayouts.layouts.find((l) => l.sceneNumber === scene.sceneNumber)!;
      const asset = assets.sceneAssets[scene.sceneNumber];

      onEvent({
        type: "reasoning-start",
        phase: "generating_scene",
        meta: {
          sceneNumber: scene.sceneNumber,
          totalScenes: resolvedBrief.scenes.length,
          purpose: scene.purpose,
        },
      });

      console.log(`[Orchestrator] Generating Scene ${scene.sceneNumber}...`);

      let sceneCode = "";
      let sceneCompileSuccess = false;
      let sceneCompileAttempts = 0;
      const maxSceneCompileAttempts = 2;
      let sceneCompileErrors: string[] = [];

      while (sceneCompileAttempts < maxSceneCompileAttempts && !sceneCompileSuccess) {
        sceneCompileAttempts++;
        if (sceneCompileAttempts > 1) {
          console.log(
            `[Orchestrator] Auto-repairing Scene ${scene.sceneNumber}, attempt ${sceneCompileAttempts}...`,
          );
        }

        try {
          sceneCode = await runStage8Scene({
            scene,
            resolvedBrief,
            layout,
            asset,
            userPrompt: prompt,
            enhancedSystemPrompt,
            detectedSkills,
            cachedTemplate,
            compileErrors: sceneCompileErrors,
            attempt: sceneCompileAttempts,
          });

          // Run Stage 9 Code Validator locally on the scene component
          const validationResult = runStage9(sceneCode);
          sceneCode = validationResult.fixedCode;

          // Run Stage 12 Compilation check
          const compileCheck = runStage12(sceneCode);
          if (compileCheck.success) {
            sceneCompileSuccess = true;
            console.log(`[Orchestrator] Scene ${scene.sceneNumber} compiled successfully!`);
          } else {
            sceneCompileErrors = compileCheck.errors;
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Scene generation failed";
          console.error(`[Orchestrator] Scene ${scene.sceneNumber} generation attempt ${sceneCompileAttempts} failed:`, err);
          sceneCompileErrors = [errMsg];
        }
      }

      if (!sceneCompileSuccess) {
        console.warn(
          `[Orchestrator] Scene ${scene.sceneNumber} failed compilation after ${maxSceneCompileAttempts} attempts. Using fallback.`,
        );
        sceneCode = `const Scene${scene.sceneNumber} = () => {
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <HeroHeadline
        title="${scene.copyText}"
        subtitle="${scene.subtext || ""}"
        heroFont="${scene.typography.heroFont}"
        secondaryFont="${scene.typography.secondaryFont}"
        accentText="${scene.accentText || ""}"
        colorPalette={{ text: "${resolvedBrief.colors.text}", accent: "${resolvedBrief.colors.accent}" }}
      />
    </AbsoluteFill>
  );
};`;
      }

      return { sceneNumber: scene.sceneNumber, code: sceneCode, success: sceneCompileSuccess, errors: sceneCompileErrors };
    });

    const sceneResults = await Promise.all(scenePromises);
    sceneResults.sort((a, b) => a.sceneNumber - b.sceneNumber);
    const sceneCodes = sceneResults.map(r => r.code);

    const anyFailed = sceneResults.some(r => !r.success);
    if (anyFailed) {
      compileScore = 0;
      const failedResult = sceneResults.find(r => !r.success);
      lastCompileErrors = failedResult?.errors || [];
    }

    // Assemble Scenes into Unified Composition
    console.log("[Orchestrator] Assembling scenes into unified composition...");
    let finalCode = buildUnifiedComposition(resolvedBrief, sceneCodes);

    // Stage 11 Refinement Loop (Auditor and Critique Loop)
    let passedAudit = false;
    let evaluation: any = null;
    let auditAttempts = 0;
    const maxAuditAttempts = 1;

    while (auditAttempts < maxAuditAttempts && !passedAudit) {
      auditAttempts++;
      if (auditAttempts > 1 && evaluation) {
        totalRefinementAttempts++;
        onEvent({ type: "reasoning-start", phase: "refining" });
        console.log(`[Orchestrator] Stage 11 Refinement, attempt ${auditAttempts}...`);

        try {
          // Re-generate using refinement agent
          const RefinementSchema = z.object({
            code: z
              .string()
              .describe("Complete, valid ES6 Remotion component code."),
            summary: z.string().describe("Refinement explanation"),
          });

          const REFINEMENT_SYSTEM_PROMPT = `You are an elite Creative Technologist, senior Motion Designer, and Remotion expert.
Your job is to take a draft Remotion component that has been critique-flagged for visual, design-taste, or conversion issues, and produce a refined, polished version that meets premium studio standards.
Preserve all image asset URL paths, rendering logic, and custom media handling.
Output ONLY valid Remotion ES6 component code, starting with imports.`;

          const refinedResult = await generateContent({
            model: getModelForTask("remotion_generation").id, // Refinement model (resolves to gemini-3-flash)
            system: REFINEMENT_SYSTEM_PROMPT,
            prompt: `## USER REQUEST:
${prompt}

## PREVIOUS UNIFIED COMPONENT (FAILED CRITIQUE):
\`\`\`tsx
${finalCode}
\`\`\`

## QUALITY CRITIQUE ISSUES TO FIX:
${evaluation.critique.map((c: string, idx: number) => `${idx + 1}. ${c}`).join("\n")}

Please fix these issues and output the refined complete React/Remotion component code starting with imports.`,
            schema: RefinementSchema,
            taskType: "remotion_generation",
          });

          let refinedDraft = refinedResult.object.code;

          // Run compile safety check and auto-repair (Stage 13)
          let compileValidation = runStage12(refinedDraft);
          let compileRepairAttempts = 0;
          while (!compileValidation.success && compileRepairAttempts < 2) {
            compileRepairAttempts++;
            totalRefinementAttempts++;
            console.log(
              `[Orchestrator] Refined code failed compile, auto-repairing compile attempt ${compileRepairAttempts}...`,
            );
            const repairResult = await runStage13(refinedDraft, compileValidation.errors);
            refinedDraft = repairResult.code;
            compileValidation = runStage12(refinedDraft);
          }

          if (compileValidation.success) {
            finalCode = refinedDraft;
            compileScore = 100;
          } else {
            compileScore = 0;
            lastCompileErrors = compileValidation.errors;
            console.warn(
              "[Orchestrator] Refined code failed compilation, using previous finalCode.",
            );
          }
        } catch (err) {
          console.error("[Orchestrator] Refinement attempt failed:", err);
        }
      }

      // Stage 10: Quality Audit
      onEvent({ type: "reasoning-start", phase: "auditing" });
      console.log("[Orchestrator] Stage 10 Quality Audit...");
      evaluation = await runStage10(finalCode, prompt);
      console.log("[Orchestrator] Audit Score:", evaluation);

      if (evaluation.averageScore >= 85) {
        passedAudit = true;
        console.log(`[Orchestrator] Unified composition PASSED audit on attempt ${auditAttempts}!`);
      } else {
        console.log(
          `[Orchestrator] Unified composition FAILED audit on attempt ${auditAttempts}. Critique:`,
          evaluation.critique,
        );
      }
    }

    // ── Phase 4: Compilation & Delivery ──

    // Stage 12 final compilation verification
    onEvent({ type: "reasoning-start", phase: "compiling" });
    let compileResult = runStage12(finalCode);
    let repairAttempts = 0;
    const maxRepairAttempts = 2;

    // Stage 13: Auto Repair compilation loop
    while (!compileResult.success && repairAttempts < maxRepairAttempts) {
      repairAttempts++;
      totalRefinementAttempts++;
      onEvent({
        type: "reasoning-start",
        phase: "compiling",
        message: `Auto-repairing compilation errors (attempt ${repairAttempts}/${maxRepairAttempts})...`,
      });
      console.log(
        `[Orchestrator] Stage 13 Auto-repairing compilation errors, attempt ${repairAttempts}/${maxRepairAttempts}...`,
      );

      try {
        const repairResult = await runStage13(finalCode, compileResult.errors);
        const validated = runStage9(repairResult.code);
        finalCode = validated.fixedCode;
        compileResult = runStage12(finalCode);
      } catch (err) {
        console.error("[Orchestrator] Auto-repair attempt failed:", err);
      }
    }

    if (!compileResult.success) {
      compileScore = 0;
      console.error(
        "[Orchestrator] Unified component failed compilation. Errors:",
        compileResult.errors,
      );
      throw new Error(`Failed to compile final ad component: ${compileResult.errors.join("; ")}`);
    }

    // Stage 14: Save Successful generation to creative memory database
    const finalScore = evaluation?.averageScore || 85;
    saveToCreativeMemory({
      prompt,
      audience: brief.audienceProfile?.audience || "General",
      emotion: brief.strategy?.core_emotion || "Trust",
      template: brief.template || "SaaS Promo",
      colorPalette: brief.colorPalette || "Midnight Royal",
      storyboard: brief.storyboard,
      finalScore,
      timestamp: new Date().toISOString(),
    });

    // Save to Approved Template Cache if score is excellent (>= 95)
    if (finalScore >= 95) {
      await saveTemplateToCache(
        prompt,
        resolvedBrief.template,
        resolvedBrief.colorPalette,
        resolvedBrief.scenes,
        finalCode,
        finalScore,
      );
    }

    // Stage 15: Telemetry/learning callback
    onEvent({
      type: "telemetry",
      data: {
        prompt,
        template: resolvedBrief.template,
        colorPalette: resolvedBrief.colorPalette,
        auditorScore: finalScore,
        compileScore,
        refinementCount: totalRefinementAttempts,
        durationMs: generationTimer(),
        userId,
        failureCause:
          compileScore < 100
            ? `Compile error: ${lastCompileErrors.join("; ")}`
            : evaluation?.averageScore >= 85
            ? null
            : `Audit failed: ${evaluation?.critique.join("; ")}`,
      },
    });

    return finalCode;
  } catch (error) {
    console.error("[Orchestrator] Critical pipeline failure:", error);
    throw error;
  }
}
