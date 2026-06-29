import { z } from "zod";
import { generateContent } from "../../provider";
import { IntentData, MarketingStrategy } from "../types";

export const StoryboardBriefSchema = z.object({
  template: z
    .enum([
      "Luxury Reveal",
      "Bold Kinetic Typography",
      "SaaS Promo",
      "Tech Product Launch",
      "E-Commerce Showcase",
      "Corporate Presentation",
      "Startup Launch",
      "Social Media Promo",
      "Futuristic Brand Campaign",
      "App Promo",
      "Motion Graphics Reel",
      "Premium Product Spotlight",
    ])
    .describe("Selected creative motion graphics template style"),

  colorPalette: z
    .enum([
      "Midnight Royal",
      "Cyber Neon",
      "Sunset Editorial",
      "Minimal Slate",
      "Luxury Gold",
      "Monochrome Premium",
      "Tech Sapphire",
      "Crimson Luxury",
    ])
    .describe("Selected premium color palette style"),

  sceneCount: z
    .number()
    .min(1)
    .max(10)
    .describe("Optimal scene count: Short: 1-3, Default Ad: 4, Product Launch: 5-8, Explainer: 6-10, Social Ad: 4-6, Luxury Reveal: 4-7"),

  audienceProfile: z.object({
    audience: z.string().describe("Primary target audience group"),
    age_range: z.string().describe("Target age demographic"),
  }),

  strategy: z.object({
    core_emotion: z
      .enum([
        "Ambition",
        "Power",
        "Luxury",
        "Trust",
        "Excitement",
        "Curiosity",
        "Belonging",
        "Achievement",
        "Confidence",
      ])
      .describe("The target emotional reaction to trigger"),
    emotional_rationale: z
      .string()
      .describe("Why this emotion builds connection for this product category"),
  }),

  storyboard: z
    .array(
      z.object({
        sceneNumber: z
          .number()
          .describe("Sequential scene identifier (1-indexed)"),
        purpose: z
          .string()
          .describe(
            "Narrative purpose of the scene (Hook, Core Message, Showcase, CTA)",
          ),
        hookElement: z
          .string()
          .describe("Hook/attention-grabbing visual element used in this scene"),

        objectives: z.object({
          visual: z.string().describe("Visual objective of this scene"),
          emotional: z.string().describe("Emotional objective/reaction to trigger"),
          typography: z
            .string()
            .describe(
              "Typography focus/rationale (e.g. bold headline, cursive accents)",
            ),
          motion: z.string().describe("Motion objective and transition vibe"),
        }),

        layout: z.object({
          direction: z
            .enum([
              "centered",
              "split-left",
              "split-right",
              "asymmetric-grid",
              "layered-overlap",
            ])
            .describe("Layout alignment structure"),
          ctaPlacement: z
            .enum([
              "none",
              "centered",
              "bottom-right",
              "clean-button-reveal",
              "action-strip",
            ])
            .describe(
              "CTA button placement (centered for final CTAs, otherwise none)",
            ),
        }),

        motion: z.object({
          motionStyle: z
            .enum([
              "kinetic_typography",
              "cinematic_reveal",
              "product_showcase",
              "luxury_motion",
              "social_reel",
              "editorial",
              "futuristic_ui",
              "app_demo",
              "corporate_modern",
            ])
            .describe("Visual motion style profile"),
          energyLevel: z
            .enum(["low", "medium", "high", "aggressive"])
            .describe("Pacing energy level"),
        }),

        assetStrategy: z.object({
          requiresAssets: z
            .boolean()
            .describe("Whether this scene requires a visual asset"),
          assetType: z
            .enum([
              "hero-product",
              "background-illustration",
              "editorial-scene",
              "abstract-graphic",
              "3d-render",
              "luxury-product-shot",
              "device-mockup",
              "character",
              "none",
            ])
            .describe("Type of visual asset required"),
          assetCount: z.number().describe("Number of assets needed (0 if none)"),
          style: z
            .enum(["Luxury", "SaaS", "Tech", "Corporate", "none"])
            .describe("Predefined style pack to apply"),
          prompt: z
            .string()
            .describe(
              "Extremely detailed, descriptive prompt for generating the image in 8k/cinematic quality. Empty if none.",
            ),
          placement: z
            .enum([
              "fullscreen",
              "left",
              "right",
              "center",
              "floating",
              "background",
              "none",
            ])
            .describe("Visual placement of the asset in the composition"),
          animationRole: z
            .enum(["hero", "supporting", "ambient", "none"])
            .describe("Animation role of the visual asset in motion"),
        }),

        time_start_pct: z
          .number()
          .describe("Percent mark when this scene starts (0-100)"),
        time_end_pct: z
          .number()
          .describe("Percent mark when this scene ends (0-100)"),
        copy_text: z.string().describe("Primary headline overlay copy text"),
        subtext: z
          .string()
          .optional()
          .describe("Supporting subtitle/body description copy text"),
        accent_text: z
          .string()
          .optional()
          .describe(
            "Secondary stylized cursive/handwritten highlight accent text (use strategically)",
          ),
      }),
    )
    .describe("Sequence of storyboard scenes"),
});

const SYSTEM_PROMPT = `You are a world-class Motion Storyboard Director.
Your task is to take the Marketing Copy Strategy and Intent Data, and output a detailed scene-by-scene Storyboard Brief.

## CRITICAL PROMPT ADHERENCE
If the user asks for a simple video with just 1 or 2 scenes, or explicitly specifies the number of scenes, set \`sceneCount\` to that exact number and output exactly that number of scene objects. Do not invent extra scenes or unrequested visual concepts.

You MUST produce a JSON object matching these EXACT keys (no other keys at root):
- template: one of "Luxury Reveal" | "Bold Kinetic Typography" | "SaaS Promo" | "Tech Product Launch" | "E-Commerce Showcase" | "Corporate Presentation" | "Startup Launch" | "Social Media Promo" | "Futuristic Brand Campaign" | "App Promo" | "Motion Graphics Reel" | "Premium Product Spotlight"
- colorPalette: one of "Midnight Royal" | "Cyber Neon" | "Sunset Editorial" | "Minimal Slate" | "Luxury Gold" | "Monochrome Premium" | "Tech Sapphire" | "Crimson Luxury"
- sceneCount: number
- audienceProfile: object with keys "audience" (string) and "age_range" (string)
- strategy: object with keys "core_emotion" (one of "Ambition" | "Power" | "Luxury" | "Trust" | "Excitement" | "Curiosity" | "Belonging" | "Achievement" | "Confidence") and "emotional_rationale" (string)
- storyboard: array of scene objects, each containing:
  * sceneNumber: number (1, 2, ...)
  * purpose: string
  * hookElement: string
  * objectives: object with keys "visual", "emotional", "typography", "motion" (all strings)
  * layout: object with keys "direction" ("centered" | "split-left" | "split-right" | "asymmetric-grid" | "layered-overlap") and "ctaPlacement" ("none" | "centered" | "bottom-right" | "clean-button-reveal" | "action-strip")
  * motion: object with keys "motionStyle" ("kinetic_typography" | "cinematic_reveal" | "product_showcase" | "luxury_motion" | "social_reel" | "editorial" | "futuristic_ui" | "app_demo" | "corporate_modern") and "energyLevel" ("low" | "medium" | "high" | "aggressive")
  * assetStrategy: object with keys "requiresAssets" (boolean), "assetType" ("hero-product" | "background-illustration" | "editorial-scene" | "abstract-graphic" | "3d-render" | "luxury-product-shot" | "device-mockup" | "character" | "none"), "assetCount" (number), "style" ("Luxury" | "SaaS" | "Tech" | "Corporate" | "none"), "prompt" (string prompt for generation, empty if none), "placement" ("fullscreen" | "left" | "right" | "center" | "floating" | "background" - DO NOT use layout direction values like "layered-overlap" or "split-left" here), and "animationRole" ("hero" | "supporting" | "ambient")
  * time_start_pct: number (0-100 start percentage of ad duration)
  * time_end_pct: number (0-100 end percentage of ad duration)
  * copy_text: string (primary overlay headline text)
  * subtext: string (optional, supporting subtitle/body text)
  * accent_text: string (optional, stylized cursive/handwritten highlight accent text)`;

export async function runStage3(
  marketingStrategy: MarketingStrategy,
  intent: IntentData,
  memoryExamples?: string,
): Promise<any> {
  const promptText = `Extracted Intent: ${JSON.stringify(intent)}
Marketing Copy Strategy: ${JSON.stringify(marketingStrategy)}
${
  memoryExamples
    ? `\nDraw inspiration from these successfully generated premium commercial structures:\n${memoryExamples}`
    : ""
}`;

  const result = await generateContent({
    model: "deepseek-v4-pro", // Primary strategist
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: StoryboardBriefSchema,
    taskType: "storyboarding",
  });

  return result.object;
}
