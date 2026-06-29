import { z } from "zod";
import { generateContent } from "../../provider";
import { IntentData, CreativeBrief } from "../types";

export const CreativeBriefSchema = z.object({
  campaignStrategy: z
    .string()
    .describe("Core strategic positioning for the ad/promo campaign"),
  emotionalPositioning: z
    .string()
    .describe(
      "How we anchor the emotional goals of the prompt in visual pacing/atmosphere",
    ),
  hookDescription: z
    .string()
    .describe(
      "The attention-grabbing visual hook setup in the initial frames",
    ),
  narrativeArc: z
    .string()
    .describe("The step-by-step storyline arc matching duration objectives"),
  conversionPsychology: z
    .string()
    .describe("Psychological pricing or persuasion techniques to employ"),
  brandVoiceGuidance: z
    .string()
    .describe(
      "Tone of voice guidance (e.g. premium, sleek, luxurious, energetic)",
    ),
});

const SYSTEM_PROMPT = `You are a world-class Advertising Creative Director from Apple's Marcom team and Pixar's storytelling division combined.
Your job is to take the user's base prompt and the extracted intent data, and develop a PREMIUM Creative Brief that will produce advertisements rivaling Apple, Stripe, Tesla, and OpenAI launch videos.

## V10 CREATIVE STANDARDS

Every brief MUST follow the 8-beat storytelling arc:
1. Hook (0-15%): A bold, attention-grabbing visual moment with high energy
2. Curiosity (15-25%): Slow down, build intrigue with subtle camera movement
3. Discovery (25-40%): Reveal the product/concept with elegant entrance animation
4. Transformation (40-55%): Show the before/after or capability with dynamic motion
5. Feature Showcase (55-70%): Key value propositions with staggered reveals
6. Social Proof (70-80%): Trust signals, testimonials, and credibility markers
7. Power Reveal (80-90%): The "wow" moment — biggest visual and emotional impact
8. CTA (90-100%): Clear call-to-action with pulsing energy

## PACING RHYTHM
Timing must follow: Fast → Slow → Fast → Pause → Reveal → Movement → Pause → Impact.
Allow breathing room between sections. Never rush information. Let moments land.

## ATMOSPHERIC DIRECTION
Every brief must specify:
- Cinematic camera style (dolly, parallax, push-in, orbit)
- Lighting mood (volumetric, ambient, neon accents, soft bloom)
- Depth treatment (glassmorphism layers, floating particles, atmospheric fog)
- Color psychology (what emotions each palette choice evokes)
- Typography energy (bold and kinetic vs elegant and restrained)

## CRITICAL PROMPT ADHERENCE
Always prioritize the user's prompt constraints. If they ask for simple, text-only, or static slides, DO NOT enforce Apple/Pixar multi-scene narrative arcs or high-energy camera movements. Focus on designing a simple brief matching their instructions.

You MUST produce a JSON object with these EXACT keys (no other keys, no nesting):
- campaignStrategy: string describing the core strategic positioning for the ad/promo campaign
- emotionalPositioning: string describing how we anchor the emotional goals of the prompt in visual pacing/atmosphere
- hookDescription: string describing the attention-grabbing visual hook setup in the initial frames
- narrativeArc: string describing the step-by-step storyline arc matching duration objectives
- conversionPsychology: string describing the psychological pricing or persuasion techniques to employ
- brandVoiceGuidance: string describing the tone of voice guidance (e.g. premium, sleek, luxurious, energetic)`;

export async function runStage1(
  prompt: string,
  intent: IntentData,
): Promise<CreativeBrief> {
  const promptText = `User Prompt: "${prompt}"
Extracted Intent: ${JSON.stringify(intent)}`;

  const result = await generateContent({
    model: "deepseek-v4-pro", // Primary strategist
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: CreativeBriefSchema,
    taskType: "storyboarding",
  });

  return result.object;
}
