import { z } from "zod";
import { generateContent } from "../../provider";
import { IntentData, CreativeBrief, MarketingStrategy } from "../types";

export const MarketingStrategySchema = z.object({
  hooks: z
    .array(z.string())
    .describe("A list of 3-5 alternative hook concepts"),
  headlineCopy: z
    .array(z.string())
    .describe("High-impact headlines for each transition/scene"),
  subheadlineCopy: z
    .array(z.string())
    .describe("Supporting copy overlays for headlines"),
  ctaCopy: z.string().describe("Final high-conversion Call to Action copy"),
  persuasionStructure: z
    .enum(["AIDA", "PAS", "StoryBrand", "Hormozi"])
    .describe("Psychological copywriting model applied"),
  benefitStatements: z
    .array(z.string())
    .describe("Value props or benefit highlights to distribute across scenes"),
});

const SYSTEM_PROMPT = `You are a Direct-Response Marketing Copywriter and conversion strategist.
Your task is to take the Creative Brief and Intent Data, and output a premium marketing copywriting structure.

## CRITICAL PROMPT ADHERENCE
If the user specifies particular text, headlines, or call-to-actions in their prompt, you MUST use them directly and not alter them or invent new ones. If they request a simple layout, make sure the hooks and copy correspond only to the requested structure.

You MUST produce a JSON object with these EXACT keys (no other keys, no nesting):
- hooks: array of strings containing 3-5 alternative hook concepts
- headlineCopy: array of strings containing high-impact headlines for each transition/scene
- subheadlineCopy: array of strings containing supporting copy overlays for headlines
- ctaCopy: string containing final high-conversion Call to Action copy
- persuasionStructure: one of "AIDA" | "PAS" | "StoryBrand" | "Hormozi"
- benefitStatements: array of strings highlighting key values or benefit statements`;

export async function runStage2(
  creativeBrief: CreativeBrief,
  intent: IntentData,
): Promise<MarketingStrategy> {
  const promptText = `Extracted Intent: ${JSON.stringify(intent)}
Creative Brief: ${JSON.stringify(creativeBrief)}`;

  const result = await generateContent({
    model: "deepseek-v4-pro", // Primary strategist
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: MarketingStrategySchema,
    taskType: "storyboarding",
  });

  return result.object;
}
