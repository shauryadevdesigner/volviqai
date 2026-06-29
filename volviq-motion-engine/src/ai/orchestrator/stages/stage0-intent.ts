import { z } from "zod";
import { generateContent } from "../../provider";
import { IntentData } from "../types";

export const IntentSchema = z.object({
  type: z
    .enum([
      "ad",
      "product_launch",
      "explainer",
      "kinetic_typography",
      "saas_promo",
      "luxury_reveal",
      "corporate",
      "brand_film",
      "social",
    ])
    .describe("Creative category of generation"),
  audience: z.string().describe("Target user base profile"),
  platform: z
    .enum([
      "tiktok",
      "youtube_shorts",
      "instagram_reels",
      "linkedin",
      "web",
      "desktop",
    ])
    .describe("Optimal layout and playback platform"),
  industry: z.string().describe("Industry category"),
  durationSeconds: z
    .number()
    .min(5)
    .max(60)
    .describe("Target duration of final video in seconds"),
  emotionalGoal: z
    .string()
    .describe("Emotion to invoke (e.g. Luxury, Trust, Curiosity)"),
  conversionGoal: z
    .string()
    .describe("Goal of call to action (e.g. Sign up, Buy now)"),
  complexity: z
    .enum(["low", "medium", "high"])
    .describe("Layout visual density complexity"),
});

const SYSTEM_PROMPT = `You are a world-class Marketing Strategist and Intent Engine.
Your job is to analyze the user's prompt and extract the high-level advertising intents, audience demographics, and format objectives.

## CRITICAL PROMPT ADHERENCE
If the user's prompt requests a single-scene, simple static slide, minimalist layout, or specifies no animations, select the lowest possible complexity ('low') and appropriate platform, and respect their intent.

You MUST produce a JSON object with these EXACT keys (no other keys, no nesting):
- type: one of "ad" | "product_launch" | "explainer" | "kinetic_typography" | "saas_promo" | "luxury_reveal" | "corporate" | "brand_film" | "social"
- audience: string describing the target user base profile
- platform: one of "tiktok" | "youtube_shorts" | "instagram_reels" | "linkedin" | "web" | "desktop"
- industry: string describing the industry category
- durationSeconds: number (between 5 and 60) for video duration
- emotionalGoal: string describing the target emotion to invoke
- conversionGoal: string describing the goal of the call to action
- complexity: one of "low" | "medium" | "high"`;

export async function runStage0(prompt: string): Promise<IntentData> {
  const result = await generateContent({
    model: "deepseek-v4-flash", // Low-latency Intent classifier
    system: SYSTEM_PROMPT,
    prompt: `Analyze the user's requirements for a motion graphic generation: "${prompt}"`,
    schema: IntentSchema,
    taskType: "fast_operation",
  });

  return result.object;
}
