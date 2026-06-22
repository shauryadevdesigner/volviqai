import { z } from "zod";
import { generateContent } from "../../provider";
import { ResolvedBrief } from "../../design-system";
import { AssetPlan } from "../types";

export const AssetPlanSchema = z.object({
  scenes: z.array(
    z.object({
      sceneNumber: z
        .number()
        .describe("Sequential scene identifier (1-indexed)"),
      requiresAssets: z
        .boolean()
        .describe("Whether this scene requires a visual asset"),
      assetType: z
        .enum([
          "product_render",
          "editorial_scene",
          "background_illustration",
          "device_mockup",
          "abstract_graphic",
          "luxury_photo",
          "character",
          "none",
        ])
        .describe("Refined type of visual asset"),
      placement: z
        .enum(["fullscreen", "left", "right", "center", "floating", "background", "none"])
        .describe("Asset placement style"),
      prompt: z
        .string()
        .describe(
          "Refined high-fidelity prompt for generating the image in 8k/cinematic quality",
        ),
      animationRole: z
        .enum(["hero", "supporting", "ambient", "none"])
        .describe("Animation role in the layout"),
    }),
  ),
});

const SYSTEM_PROMPT = `You are a Visual Asset Planner for a premium motion design agency.
Your task is to review the Storyboard and Resolved Design System, and plan/refine the visual assets needed.
Specifically, review the image prompts and optimize them to produce stunning, ultra-premium visual quality (e.g., matching luxury, SaaS, or tech styling).
Ensure prompts have detailed lighting description, surface details, composition, and are suited for AI generation (e.g. Flux-1 / Stable Diffusion).

You MUST produce a JSON object matching these EXACT keys:
- scenes: array of objects, each containing:
  * sceneNumber: number (1-indexed)
  * requiresAssets: boolean
  * assetType: one of "product_render" | "editorial_scene" | "background_illustration" | "device_mockup" | "abstract_graphic" | "luxury_photo" | "character" | "none"
  * placement: one of "fullscreen" | "left" | "right" | "center" | "floating" | "background"
  * prompt: string (extremely detailed 8k prompt, or empty if requiresAssets is false)
  * animationRole: one of "hero" | "supporting" | "ambient" | "none"`;

export async function runStage5(
  resolvedBrief: ResolvedBrief,
): Promise<AssetPlan> {
  const promptText = `Storyboard Brief: ${JSON.stringify(resolvedBrief)}`;

  const result = await generateContent({
    model: "gemini-3.5-flash", // Asset planner
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: AssetPlanSchema,
    taskType: "storyboarding",
  });

  return result.object;
}
