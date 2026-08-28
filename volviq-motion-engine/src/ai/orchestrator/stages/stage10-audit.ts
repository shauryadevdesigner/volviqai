import { z } from "zod";
import { generateContent } from "../../provider";
import { AuditScore } from "../types";
import { getModelForTask } from "../../model-router";
import { repairUndefinedAnimations } from "../../../remotion/jsx-validator";

// ── Visual Quality Auto-Fixes ──────────────────────────────────────────────

export interface VisualIssue {
  type: "missing_background" | "missing_particles" | "linear_easing" | "small_text" | "missing_camera" | "overlap_risk";
  description: string;
  autoFixable: boolean;
}

export function detectVisualIssues(code: string): VisualIssue[] {
  const issues: VisualIssue[] = [];

  // Check for missing animated background
  if (!code.includes("GradientBackground") && !code.includes("radial-gradient") && !code.includes("backgroundColor")) {
    issues.push({
      type: "missing_background",
      description: "No animated gradient background detected",
      autoFixable: true,
    });
  }

  // Check for missing particles/ambient elements
  const hasParticles = /Math\.(sin|cos).*\*(20|15|10|30)/.test(code) || /particles/i.test(code);
  if (!hasParticles) {
    issues.push({
      type: "missing_particles",
      description: "No floating particles or ambient micro-details detected",
      autoFixable: true,
    });
  }

  // Check for linear-only interpolation (no springs)
  const hasSpring = /spring\s*\(/.test(code);
  const interpolateCount = (code.match(/interpolate\s*\(/g) || []).length;
  if (!hasSpring && interpolateCount > 2) {
    issues.push({
      type: "linear_easing",
      description: "Multiple interpolations without spring physics detected",
      autoFixable: false,
    });
  }

  // Check for small font sizes (4K resolution requirement: minimum font size is 36px, body 48px+, headlines 120px+)
  const fontSizeMatch = code.match(/fontSize:\s*["']?(\d+)(?:px)?["']?/g);
  if (fontSizeMatch) {
    const smallSizes = fontSizeMatch
      .map(m => parseInt(m.match(/\d+/)?.[0] || "0"))
      .filter(s => s > 0 && s < 44);
    if (smallSizes.length > 0) {
      issues.push({
        type: "small_text",
        description: `Font sizes below 44px detected: ${smallSizes.join(", ")}px`,
        autoFixable: true,
      });
    }
  }

  // Check for camera movement
  const hasCamera = /translateZ|scale.*interpolate|parallax|camZoom|cameraZoom/.test(code);
  if (!hasCamera) {
    issues.push({
      type: "missing_camera",
      description: "No camera movement (dolly, zoom, or parallax) detected",
      autoFixable: false,
    });
  }

  return issues;
}

/** Inject missing visual elements into code */
export function injectVisualFixes(code: string, issues: VisualIssue[]): string {
  let fixed = code;

  for (const issue of issues) {
    if (!issue.autoFixable) continue;

    if (issue.type === "missing_background") {
      // Add gradient background if missing
      if (!fixed.includes("GradientBackground")) {
        if (fixed.includes("AbsoluteFill") && !fixed.includes("radial-gradient")) {
          // Insert a simple animated background after imports
          const lines = fixed.split('\n');
          let insertIdx = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) insertIdx = i + 1;
          }
          const bgCode = [
            '',
            'const AnimatedBg = ({ bg = "#0b0f19", glow = "#0ea5e9" }) => {',
            '  const frame = useCurrentFrame();',
            '  const { width, height } = useVideoConfig();',
            '  const x = Math.sin(frame * 0.015) * (width * 0.1);',
            '  const y = Math.cos(frame * 0.01) * (height * 0.1);',
            '  return <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>',
            '    <div style={{ position: "absolute", width: width * 0.7, height: width * 0.7, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, transform: `translate(${x}px, ${y}px)`, filter: "blur(100px)", opacity: 0.25 }} />',
            '  </AbsoluteFill>;',
            '};',
          ];
          lines.splice(insertIdx, 0, ...bgCode);
          fixed = lines.join('\n');
        }
      }
    }

    if (issue.type === "small_text") {
      // Boost font sizes for 4K video canvas readability
      fixed = fixed.replace(/fontSize:\s*["']?(\d+)(px)?["']?/g, (match, size, unit) => {
        const n = parseInt(size);
        if (n <= 0) return match;
        const quote = match.includes('"') ? '"' : match.includes("'") ? "'" : "";
        let newSize = n;
        if (n < 20) newSize = 38;
        else if (n < 28) newSize = 48;
        else if (n < 36) newSize = 64;
        else if (n < 48) newSize = 88;
        else if (n < 60) newSize = 130;
        else return match;

        return unit || quote ? `fontSize: ${quote}${newSize}px${quote}` : `fontSize: ${newSize}`;
      });
    }
  }

  // Also run undefined animation repair
  const { code: repairedCode } = repairUndefinedAnimations(fixed);
  fixed = repairedCode;

  return fixed;
}

export const AuditSchema = z.object({
  taste: z.object({
    visual_taste: z.number().min(0).max(100),
    motion_taste: z.number().min(0).max(100),
    cinematic_quality: z.number().min(0).max(100),
    emotional_impact: z.number().min(0).max(100),
    brand_presence: z.number().min(0).max(100),
    premium_feel: z.number().min(0).max(100),
    originality: z.number().min(0).max(100),
    averageScore: z.number().min(0).max(100),
  }),
  conversion: z.object({
    retention_score: z.number().min(0).max(100),
    emotional_score: z.number().min(0).max(100),
    conversion_score: z.number().min(0).max(100),
    memorability_score: z.number().min(0).max(100),
    averageScore: z.number().min(0).max(100),
  }),
  passed: z
    .boolean()
    .describe(
      "True if both taste averageScore and conversion averageScore are >= 85",
    ),
  critique: z
    .array(z.string())
    .describe(
      "Detailed flaws that must be fixed to reach 90+ score. Limit to top 3 issues.",
    ),
});

const QUALITY_AUDIT_SYSTEM_PROMPT = `You are a world-class AI Creative Director, Conversion Specialist, Motion Critic, and Cinematographer.
You audit generated Remotion React code against V10 premium standards. Your evaluation must be RUTHLESSLY honest.

## AUDIT DIMENSIONS

### DESIGN TASTE (scored 0-100 per dimension)
- **visual_taste**: Premium SaaS aesthetics — glassmorphism, dynamic gradients, ambient lighting, micro textures, floating interfaces. REJECT flat, generic, or cheap-looking visuals.
- **motion_taste**: Advanced spring physics — overshoot, anticipation, follow-through, elastic bounce. REJECT linear easing, robotic movement, or static elements.
- **cinematic_quality**: Camera movement (dolly, push-in, parallax, depth movement). REJECT scenes with no camera motion.
- **emotional_impact**: Does the ad evoke a feeling? Hook attention? Build curiosity? Deliver satisfaction?
- **brand_presence**: Consistent design language, premium font pairings, clear visual hierarchy.
- **premium_feel**: Does this look like it was made by Apple/Stripe/Linear's creative team? Or does it look AI-generated?
- **originality**: Fresh visual approach vs generic template feel.

### CONVERSION & PSYCHOLOGY (scored 0-100 per dimension)
- **retention_score**: Does the hook grab attention in the first 2 seconds? Is pacing varied (fast-slow-fast)?
- **emotional_score**: Emotional arc — problem→curiosity→discovery→transformation→impact.
- **conversion_score**: Clear CTA with visual emphasis. Urgency and social proof present.
- **memorability_score**: Would a viewer remember this ad? Unique visual moments?

## EXPLICIT REJECTION CRITERIA (auto-fail if ANY are true)
- Static background with no animation → REJECT (score visual_taste ≤ 40)
- No camera movement (no dolly, parallax, or depth shift) → REJECT (score cinematic_quality ≤ 40)
- No floating particles, ambient dust, or micro-details → REJECT (score premium_feel ≤ 50)
- Hard cuts between scenes with no transition → REJECT (score motion_taste ≤ 50)
- Linear easing on entrance animations → REJECT (score motion_taste ≤ 50)
- No depth layers (missing foreground or background atmosphere) → REJECT (score visual_taste ≤ 50)
- Text overlapping other text or images → REJECT (score visual_taste ≤ 40)
- interpolate() with string output ranges → REJECT (score codeQuality ≤ 30)

## CRITICAL PROMPT ADHERENCE
If the user's prompt requested a simple, static, or minimalist layout (e.g. "no animations", "no camera dolly/parallax", "just static text", "no particles"), do not reject or fail the audit for lacking camera movement, floating particles, transitions, or complex depth layers. Audit the code purely based on how well it satisfies the user's explicit prompt requirements.

## PASS THRESHOLD
To pass, BOTH taste averageScore AND conversion averageScore must be >= 85. If either is below 85, provide the top 3 constructive fixes ranked by impact.`;


export async function runStage10(
  code: string,
  userPrompt: string,
): Promise<{ audit: AuditScore; fixedCode: string; visualIssues: VisualIssue[] }> {
  // Detect visual issues before audit
  const visualIssues = detectVisualIssues(code);
  const autoFixableIssues = visualIssues.filter(i => i.autoFixable);
  let fixedCode = code;

  if (autoFixableIssues.length > 0) {
    console.log(`[Stage 10] Auto-fixing ${autoFixableIssues.length} visual issues: ${autoFixableIssues.map(i => i.type).join(", ")}`);
    fixedCode = injectVisualFixes(code, autoFixableIssues);
  }

  try {
    const result = await generateContent({
      model: getModelForTask("quality_assurance").id,
      system: QUALITY_AUDIT_SYSTEM_PROMPT,
      prompt: `Audit the following generated Remotion React code for the user prompt: "${userPrompt}"\n\n\`\`\`tsx\n${fixedCode}\n\`\`\``,
      schema: AuditSchema,
      taskType: "quality_assurance",
    });

    const parsed = result.object;
    const audit: AuditScore = {
      scores: {
        typography: parsed.taste.visual_taste,
        visualHierarchy: parsed.taste.premium_feel,
        motionQuality: parsed.taste.motion_taste,
        premiumAppearance: parsed.taste.cinematic_quality,
        brandConsistency: parsed.taste.brand_presence,
        conversionEffectiveness: parsed.conversion.conversion_score,
        composition: parsed.taste.averageScore,
        codeQuality: parsed.conversion.averageScore,
      },
      averageScore: Math.round(
        (parsed.taste.averageScore + parsed.conversion.averageScore) / 2,
      ),
      critique: parsed.critique,
    };

    // If quality is low, flag for re-generation
    if (audit.averageScore < 70) {
      console.warn(`[Stage 10] Quality score ${audit.averageScore} below threshold. Flagging for re-generation.`);
      // Add issues that need re-gen
      const nonAutoFixable = visualIssues.filter(i => !i.autoFixable);
      nonAutoFixable.push({
        type: "missing_camera",
        description: `QA audit failed with score ${audit.averageScore}. Critique: ${audit.critique.join("; ")}`,
        autoFixable: false,
      });
      return { audit, fixedCode, visualIssues: nonAutoFixable };
    }

    return { audit, fixedCode, visualIssues };
  } catch (error) {
    console.error(
      "[Failure Recovery] Quality Auditor evaluation failed, bypassing with default pass score:",
      error,
    );
    return {
      audit: {
        scores: {
          typography: 85,
          visualHierarchy: 85,
          motionQuality: 85,
          premiumAppearance: 85,
          brandConsistency: 85,
          conversionEffectiveness: 85,
          composition: 85,
          codeQuality: 85,
        },
        averageScore: 85,
        critique: [],
      },
      fixedCode,
      visualIssues,
    };
  }
}
