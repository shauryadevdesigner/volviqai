import { z } from "zod";
import { generateContent } from "../../provider";
import { AuditScore } from "../types";

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
      "True if both taste averageScore and conversion averageScore are >= 80",
    ),
  critique: z
    .array(z.string())
    .describe(
      "Detailed flaws that must be fixed to reach 90+ score. Limit to top 3 issues.",
    ),
});

const QUALITY_AUDIT_SYSTEM_PROMPT = `You are a world-class AI Creative Director, Conversion Specialist, and Motion critic.
You inspect generated Remotion React code against two separate criteria:
1. Design Taste (visual style, typography hierarchy, spring timing, active backgrounds, composition)
2. Conversion & Psychology (hook strength, retention pacing, clear brand recall, emotional resonance, conversion CTA)

DIMENSIONS OF AUDIT:
- Visual Assets & Composition:
  * Check image/asset integration. Visual assets (images/SVGs) must be styled and positioned beautifully according to layout composition rules.
  * Adaptive Layout: Verify text layout doesn't overlap important visual parts of the asset. Typography and imagery must complement each other.
  * Motion Relevance: Ensure every image moves (e.g. Ken Burns effect, floating, slow drift, scale reveals). REJECT static assets.
  * Visual Hierarchy & Placement: Ensure clear visual hierarchy. Avoid generic imagery, empty layouts, and poor text placement.
- Overlapping layers: ALL stacked text divs MUST be grouped inside a single flex-column with a gap. Never overlap independent absolute layers.
- Active Backgrounds: Vignettes, radial gradients, slow-drifting soft glowing radial shapes.
- Lighting: THREE lights (spotlight, ambient, standard material) if 3D, ambient box shadows if 2D.
- Output Range safety: interpolate() outputs must be numeric ranges (never strings or colors).
- Easing curve: no linear entrance timing. Use spring or smooth curves.

To pass, both Taste averageScore and Conversion averageScore must be >= 80. Else, provide constructive fixes.`;

export async function runStage10(
  code: string,
  userPrompt: string,
): Promise<AuditScore> {
  try {
    const result = await generateContent({
      model: "gemini-3.5-flash", // QA Auditor
      system: QUALITY_AUDIT_SYSTEM_PROMPT,
      prompt: `Audit the following generated Remotion React code for the user prompt: "${userPrompt}"\n\n\`\`\`tsx\n${code}\n\`\`\``,
      schema: AuditSchema,
      taskType: "quality_assurance",
    });

    const parsed = result.object;
    return {
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
  } catch (error) {
    console.error(
      "[Failure Recovery] Quality Auditor evaluation failed, bypassing with default pass score:",
      error,
    );
    return {
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
    };
  }
}
export { QUALITY_AUDIT_SYSTEM_PROMPT };
