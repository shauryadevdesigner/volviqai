import { z } from "zod";
import { generateContent } from "../../provider";
import { ResolvedBrief, ResolvedScene } from "../../design-system";
import { GeneratedAssetItem, SceneLayoutItem } from "../types";
import { getModelForTask } from "../../model-router";

export const SceneGenerationSchema = z.object({
  code: z
    .string()
    .describe(
      "Component body code for the scene, starting with component declaration.",
    ),
});

export async function runStage8Scene(params: {
  scene: ResolvedScene;
  resolvedBrief: ResolvedBrief;
  layout: SceneLayoutItem;
  asset: GeneratedAssetItem | undefined;
  userPrompt: string;
  enhancedSystemPrompt: string;
  detectedSkills: string[];
  cachedTemplate: any;
  compileErrors?: string[];
  attempt?: number;
}): Promise<string> {
  const {
    scene,
    resolvedBrief,
    layout,
    asset,
    userPrompt,
    enhancedSystemPrompt,
    cachedTemplate,
    compileErrors,
    attempt = 1,
  } = params;

  const hasAsset = asset !== undefined;
  const assetInfo = hasAsset
    ? `\n## SCENE VISUAL ASSET (INTEGRATION REQUIRED):
- Asset URL: "${asset.imageUrl}"
- Asset Type: "${scene.assetStrategy.assetType}"
- Placement Style: "${scene.assetStrategy.placement}"
- Animation Role: "${scene.assetStrategy.animationRole}"
- Prompt used for generation: "${scene.assetStrategy.prompt}"

You MUST integrate this asset into the layout according to the following layout & animation rules:
1. LAYOUT COMPOSITION: Use coordinates defined by the architect layout engine:
   * Container style: ${layout.elementCoords.container}
   * Asset wrapper style: ${layout.elementCoords.assetWrapper}
   * Text wrapper style: ${layout.elementCoords.textWrapper}
   * Render image as: <Img src="${asset.imageUrl}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> (or similar fit) inside the assetWrapper.
2. ANIMATION & MOTION: Every image/asset MUST have continuous animation. Use spring() or interpolate() (e.g. scale, drift parallax, tilt). Static assets are unacceptable.`
    : "";

  const SCENE_QUALITY_DIRECTIVE = `
## V10 PREMIUM SCENE REQUIREMENTS (MANDATORY)
This scene MUST satisfy ALL of the following or it will be REJECTED:

1. CINEMATIC CAMERA: Add a slow dolly (scale 1.0→1.03) or parallax (background drifts at 0.3x speed).
   const cameraZoom = interpolate(frame, [0, sceneDuration], [1.0, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

2. DEPTH LAYERS: Build 3 visual layers:
   - Background: GradientBackground + large blurred atmospheric circles that drift slowly
   - Midground: Primary content with spring-animated entrances
   - Foreground: 3-6 floating particle divs (2-4px, opacity 0.1-0.3) with sin/cos drift

3. PREMIUM MICRO-DETAILS: Include at least 3:
   - Floating particles with randomized drift
   - Breathing glow pulses (opacity oscillating with Math.sin)
   - Subtle vignette overlay (radial gradient)
   - Edge highlights on glass elements
   - Ambient shadow movement

4. ADVANCED MOTION: Use spring() with overshoot configs (damping 10-16, stiffness 160-220). Elements must anticipate, overshoot, and settle. NO linear interpolation for entrances.

5. TYPOGRAPHY: Headlines must use word-by-word staggered reveals (split text, delay each word by 3-5 frames). Use tight letter-spacing (-0.02em). Since the composition runs at a 4K resolution (3840x2160), use prominent medium-to-large sizing: 130px to 200px (or 8-12rem) for heroes, 56px to 80px (or 3.5-5rem) for subtitles, and 36px to 48px for details/descriptions. Ensure all text and elements are sized generously to fill and cover the screen beautifully.

6. BREATHING IDLE: All elements not actively animating must have subtle breathing: scale: 1 + Math.sin(frame * 0.03) * 0.008 or gentle translateY float.

7. NO STATIC ANYTHING: Every visible element must have at least subtle continuous motion.

## USER PROMPT OVERRIDE (HIGHEST PRIORITY)
If the user's prompt indicates a preference for simplicity, minimalism, static elements, or specific layout/styling (e.g. "no animations", "no floating particles", "just static text", "single scene", "no camera pans"), prioritize these constraints over the default requirements above. Do NOT add floating particles, camera zooms, or text splits if they contradict the user's explicit instructions.`;

  const scenePrompt = `Generate a single React component Scene${scene.sceneNumber} for Scene ${scene.sceneNumber} of this ad.
User Prompt Context: "${userPrompt}"
Template Style: ${resolvedBrief.template}
Color Palette: ${resolvedBrief.colorPalette}
Scene Purpose: ${scene.purpose}
${SCENE_QUALITY_DIRECTIVE}

## RIVE & MOTION ENGINE (NEW CAPABILITY)
You can embed high-fidelity Rive vector animations using:
<RivePlayer src={staticFile("assets/rive/filename.riv")} animation="play" fit="contain" style={{ width: "100%", height: "100%" }} />
For wrapping standard HTML/React elements with high-end spring entrance animations, use:
<MotionWrapper animationType="scale-in" delay={5} duration={30} intensity={1.1}>Your Element</MotionWrapper>
Available animationTypes: "scale-in" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "blur-in" | "drift-parallax" | "breathing-idle" | "none".
Use these primitives instead of custom CSS/JS animations where possible.

Scene Storyboard Details:
- Primary Copy: "${scene.copyText}"
- Secondary Subtext: "${scene.subtext || ""}"
- Stylized Accent Text: "${scene.accentText || ""}"
- Layout Direction: ${scene.layout.direction} (textHierarchy: ${scene.layout.textHierarchy})
- Spacing Scale: ${JSON.stringify(resolvedBrief.spacing || {})}
- Font Pairings: Hero: "${scene.typography.heroFont}", Secondary: "${scene.typography.secondaryFont}", Accent: "${scene.typography.accentFont}"
- Visual Background Vibe: ${scene.visualTreatment.background}
- Motion Vibe: ${scene.motion.motionStyle} (Damping: ${scene.motion.damping || 22}, Stiffness: ${scene.motion.stiffness || 160})
- Transitions Vibe: ${scene.visualTreatment.transition}
- Camera Movement: ${scene.motion.cameraStyle}
${assetInfo}

${
  cachedTemplate
    ? `\n## REFERENCE TEMPLATE BLUEPRINT\nYou MUST reuse and adapt the layout and motion flow from this successfully approved commercial structure:\n\`\`\`tsx\n${cachedTemplate.code}\n\`\`\`\nClone this exact layout style and animation curve logic, but swap the titles, subtitles, descriptions, and fonts to match our scene storyboard.`
    : ""
}

Guidelines:
- Return ONLY the React component body named: const Scene${scene.sceneNumber} = () => { ... }
- Wrap all animations inside useCurrentFrame() and useVideoConfig() springs.
- Do NOT output any markdown tags. Output JSON with a 'code' string parameter.`;

  const systemPromptWithRef = `${enhancedSystemPrompt}

Return only the single React/Remotion component Scene${scene.sceneNumber} matching the prompt specifications.`;

  const promptText =
    attempt === 1
      ? scenePrompt
      : `${scenePrompt}\n\nCRITICAL: Compilation failed on previous attempt. Fix these compilation errors:\n${compileErrors?.join("\n")}\n\nReturn ONLY the fixed component declaration code.`;

  const codeResult = await generateContent({
    model: getModelForTask("remotion_generation").id, // Dynamically resolved coder model
    system: systemPromptWithRef,
    prompt: promptText,
    schema: SceneGenerationSchema,
    taskType: "remotion_generation",
  });

  return codeResult.object.code;
}

export function buildUnifiedComposition(
  brief: ResolvedBrief,
  sceneCodes: string[],
): string {
  const importLines: string[] = [];

  importLines.push(
    "import React, { useState, useEffect, useMemo, useRef } from 'react';",
  );
  importLines.push(
    "import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';",
  );
  importLines.push(
    "import { GradientBackground, HeroHeadline, GlassCard, FeatureGrid, PremiumCTA, KineticText, AnimatedNumber, LogoWall, RivePlayer, RiveLoader, MotionWrapper } from '../ai/components-library';",
  );
  importLines.push(
    "import { SPRINGS, SPACING, BORDER_RADIUS, SHADOWS, GLOWS, BLURS } from '../ai/design-tokens';",
  );

  const cleanedScenes = sceneCodes.map((code, idx) => {
    const sceneNum = idx + 1;
    let cleaned = code;

    // Strip import statements
    cleaned = cleaned.replace(
      /import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g,
      "",
    );

    // Strip default/named exports
    cleaned = cleaned.replace(
      /export\s+default\s+(?:function|class|const|let|var)?\s*\w+;?/g,
      "",
    );
    cleaned = cleaned.replace(/export\s+default\s+/g, "");
    cleaned = cleaned.replace(
      /export\s+(const|let|var|function|class)\b/g,
      "$1",
    );

    // Rewrite component names to Scene1, Scene2, etc.
    cleaned = cleaned.replace(
      /(const|let|var|function)\s+(?:VolviqAd|VolviqAnimation|MyAnimation|Animation|AdComponent|DynamicComponent|DynamicAnimation)\b/g,
      `$1 Scene${sceneNum}`,
    );

    return cleaned.trim();
  });

  let wrapper = `export const VolviqAnimation = () => {\n`;
  wrapper += `  const { durationInFrames } = useVideoConfig();\n`;
  wrapper += `  const frameFromPct = (pct: number) => Math.round(durationInFrames * (pct / 100));\n\n`;
  wrapper += `  return (\n`;
  wrapper += `    <AbsoluteFill>\n`;
  wrapper += `      <GradientBackground bg="${brief.colors.bg}" glow="${brief.colors.glow}" accent="${brief.colors.accent}" />\n`;

  brief.scenes.forEach((scene, idx) => {
    const startPct = scene.time_start_pct;
    const endPct = scene.time_end_pct;
    const isLast = idx === brief.scenes.length - 1;

    const startFrameExpr = startPct === 0 ? "0" : `frameFromPct(${startPct})`;
    const durationExpr = isLast
      ? `durationInFrames - ${startFrameExpr}`
      : `frameFromPct(${endPct}) - ${startFrameExpr}`;

    wrapper += `      <Sequence from={${startFrameExpr}} durationInFrames={${durationExpr}}>\n`;
    wrapper += `        <Scene${scene.sceneNumber} />\n`;
    wrapper += `      </Sequence>\n`;
  });

  wrapper += `    </AbsoluteFill>\n`;
  wrapper += `  );\n`;
  wrapper += `};`;

  const header = `/*\n * Generated by Volviq V10 Premium Motion Engine\n * Cinematic Camera | Depth Layers | Premium Micro-Details | Advanced Physics\n */\n\n`;
  return (
    header +
    importLines.join("\n") +
    "\n\n" +
    cleanedScenes.join("\n\n") +
    "\n\n" +
    wrapper
  );
}
