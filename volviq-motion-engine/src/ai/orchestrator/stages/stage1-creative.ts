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

const SYSTEM_PROMPT = `You are a world-class Advertising Creative Director and strategist.
Your job is to take the user's base prompt and the extracted intent data, and develop a premium Creative Brief.

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
    model: "gemini-3.5-flash", // Primary strategist
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: CreativeBriefSchema,
    taskType: "storyboarding",
  });

  return result.object;
}
