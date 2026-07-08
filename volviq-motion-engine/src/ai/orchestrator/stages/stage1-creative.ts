import { z } from "zod";
import { generateContent } from "../../provider";

export const ConsolidatedBriefSchema = z.object({
  // From Stage 0 (Intent)
  intent: z.object({
    type: z.enum([
      "ad",
      "product_launch",
      "explainer",
      "kinetic_typography",
      "saas_promo",
      "luxury_reveal",
      "corporate",
      "brand_film",
      "social",
    ]).describe("Creative category of generation"),
    audience: z.string().describe("Target user base profile"),
    platform: z.enum([
      "tiktok",
      "youtube_shorts",
      "instagram_reels",
      "linkedin",
      "web",
      "desktop",
    ]).describe("Optimal layout and playback platform"),
    industry: z.string().describe("Industry category"),
    durationSeconds: z.number().min(5).max(60).describe("Target duration of final video in seconds"),
    emotionalGoal: z.string().describe("Emotion to invoke (e.g. Luxury, Trust, Curiosity)"),
    conversionGoal: z.string().describe("Goal of call to action (e.g. Sign up, Buy now)"),
    complexity: z.enum(["low", "medium", "high"]).describe("Layout visual density complexity"),
  }),

  // From Stage 1 (Creative Brief)
  creativeBrief: z.object({
    campaignStrategy: z.string().describe("Core strategic positioning for the ad/campaign"),
    emotionalPositioning: z.string().describe("How to anchor emotional goals in visual pacing/atmosphere"),
    hookDescription: z.string().describe("Attention-grabbing visual hook setup in initial frames"),
    narrativeArc: z.string().describe("Step-by-step storyline arc matching duration objectives"),
    conversionPsychology: z.string().describe("Psychological pricing or persuasion techniques to employ"),
    brandVoiceGuidance: z.string().describe("Tone of voice guidance (e.g. premium, sleek, luxurious, energetic)"),
  }),

  // From Stage 2 (Marketing Copy)
  marketingStrategy: z.object({
    hooks: z.array(z.string()).describe("A list of 3-5 alternative hook concepts"),
    ctaCopy: z.string().describe("Final high-conversion Call to Action copy"),
    persuasionStructure: z.enum(["AIDA", "PAS", "StoryBrand", "Hormozi"]).describe("Psychological copywriting model applied"),
    benefitStatements: z.array(z.string()).describe("Value props or benefit highlights to distribute across scenes"),
  }),

  // From Stage 3 (Storyboard)
  template: z.enum([
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
  ]).describe("Selected creative motion graphics template style"),

  colorPalette: z.enum([
    "Midnight Royal",
    "Cyber Neon",
    "Sunset Editorial",
    "Minimal Slate",
    "Luxury Gold",
    "Monochrome Premium",
    "Tech Sapphire",
    "Crimson Luxury",
  ]).describe("Selected premium color palette style"),

  sceneCount: z.number().min(1).max(10).describe("Optimal scene count"),

  audienceProfile: z.object({
    audience: z.string().describe("Primary target audience group"),
    age_range: z.string().describe("Target age demographic"),
  }),

  strategy: z.object({
    core_emotion: z.enum([
      "Ambition",
      "Power",
      "Luxury",
      "Trust",
      "Excitement",
      "Curiosity",
      "Belonging",
      "Achievement",
      "Confidence",
    ]).describe("The target emotional reaction to trigger"),
    emotional_rationale: z.string().describe("Why this emotion builds connection for this product category"),
  }),

  storyboard: z.array(
    z.object({
      sceneNumber: z.number().describe("Sequential scene identifier (1-indexed)"),
      purpose: z.string().describe("Narrative purpose (Hook, Core Message, Showcase, CTA)"),
      hookElement: z.string().describe("Hook/attention-grabbing visual element used in this scene"),
      objectives: z.object({
        visual: z.string().describe("Visual objective of this scene"),
        emotional: z.string().describe("Emotional objective/reaction to trigger"),
        typography: z.string().describe("Typography focus/rationale"),
        motion: z.string().describe("Motion objective and transition vibe"),
      }),
      layout: z.object({
        direction: z.enum([
          "centered",
          "split-left",
          "split-right",
          "asymmetric-grid",
          "layered-overlap",
        ]).describe("Layout alignment structure"),
        ctaPlacement: z.enum([
          "none",
          "centered",
          "bottom-right",
          "clean-button-reveal",
          "action-strip",
        ]).describe("CTA button placement"),
      }),
      motion: z.object({
        motionStyle: z.enum([
          "kinetic_typography",
          "cinematic_reveal",
          "product_showcase",
          "luxury_motion",
          "social_reel",
          "editorial",
          "futuristic_ui",
          "app_demo",
          "corporate_modern",
        ]).describe("Visual motion style profile"),
        energyLevel: z.enum(["low", "medium", "high", "aggressive"]).describe("Pacing energy level"),
      }),
      assetStrategy: z.object({
        requiresAssets: z.boolean().describe("Whether this scene requires a visual asset"),
        assetType: z.enum([
          "product_render",
          "editorial_scene",
          "background_illustration",
          "device_mockup",
          "abstract_graphic",
          "luxury_photo",
          "character",
          "none",
        ]).describe("Type of visual asset required"),
        assetCount: z.number().describe("Number of assets needed (0 if none)"),
        style: z.enum(["Luxury", "SaaS", "Tech", "Corporate", "none"]).describe("Predefined style pack to apply"),
        prompt: z.string().describe("Extremely detailed, descriptive prompt for generating the image in 8k/cinematic quality. Empty if none."),
        placement: z.enum([
          "fullscreen",
          "left",
          "right",
          "center",
          "floating",
          "background",
          "none",
        ]).describe("Visual placement of the asset in the composition"),
        animationRole: z.enum(["hero", "supporting", "ambient", "none"]).describe("Animation role of the visual asset in motion"),
      }),
      time_start_pct: z.number().describe("Percent mark when this scene starts (0-100)"),
      time_end_pct: z.number().describe("Percent mark when this scene ends (0-100)"),
      copy_text: z.string().describe("Primary headline overlay copy text"),
      subtext: z.string().optional().describe("Supporting subtitle/body description copy text"),
      accent_text: z.string().optional().describe("Secondary stylized cursive/handwritten highlight accent text"),
    })
  ).describe("Sequence of storyboard scenes"),
});

const SYSTEM_PROMPT = `You are a world-class Marketing Strategist, Art Director, and Copywriter.
Your task is to take the user's prompt and generate a consolidated campaign and storyboard plan.
Combine intent intelligence, narrative arcs, and visual planning in a single pass.

## CREATIVE STANDARDS
Every video storyboard must follow a narrative rhythm: Hook (0-15%) -> Intrigue/Curiosity -> Discovery & Reveal -> Key Feature Showcase -> Trust/Social Proof -> High-impact CTA.
Pacing must feel premium and polished: Fast -> Slow -> Fast -> Pause.

## DESIGN & PALETTE SELECTIONS
- Pick an optimal motion graphics template that fits the user's product or industry.
- Choose a premium color palette (e.g. Minimal Slate, Cyber Neon, Luxury Gold, Tech Sapphire).

## VISUAL ASSETS
If the storyboard scenes require visual assets (images, mockups, etc.), specify "requiresAssets: true" and provide extremely descriptive, high-quality image prompts suitable for generating with AI (Flux/Imagen). Include details like surface materials, volumetric lighting, and layout placement.
If the user's prompt explicitly requests a clean design, text-only layout, or no images/illustrations, set "requiresAssets: false" and "prompt: ''" for all scenes.

## CRITICAL PROMPT ADHERENCE
Always respect user constraints: if they specify particular text/headlines or requested count of scenes/slides, prioritize them exactly.
Produce a single structured JSON response matching the ConsolidatedBriefSchema.`;

export async function runConsolidatedBrief(
  prompt: string,
  memoryExamples?: string,
): Promise<any> {
  const promptText = `User Prompt: "${prompt}"
${memoryExamples ? `\nDraw inspiration from these historical examples:\n${memoryExamples}` : ""}`;

  const result = await generateContent({
    model: "deepseek-v4-pro", // Heavy reasoning strategist model
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: ConsolidatedBriefSchema,
    taskType: "storyboarding",
  });

  return result.object;
}
