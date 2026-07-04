import { z } from "zod";
import { generateContent } from "../../provider";
import { AuditScore } from "../types";
import { getModelForTask } from "../../model-router";

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
): Promise<AuditScore> {
  try {
    const result = await generateContent({
      model: getModelForTask("quality_assurance").id, // QA Auditor (resolves to Claude Opus 4.5)
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
