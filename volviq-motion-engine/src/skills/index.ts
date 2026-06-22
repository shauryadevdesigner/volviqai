import { examples } from "@/examples/code";

// Import markdown files at build time
import threeDSkill from "./3d.md";
import chartsSkill from "./charts.md";
import cinematicAdSkill from "./cinematic-ad.md";
import lightingCompositionSkill from "./lighting-composition.md";
import messagingSkill from "./messaging.md";
import sequencingSkill from "./sequencing.md";
import socialMediaSkill from "./social-media.md";
import springPhysicsSkill from "./spring-physics.md";
import transitionsSkill from "./transitions.md";
import typographySkill from "./typography.md";
import performanceSkill from "./performance.md";
import designSystemSkill from "./design-system.md";

// Guidance skills (markdown files with patterns/rules)
const GUIDANCE_SKILLS = [
  "charts",
  "typography",
  "social-media",
  "messaging",
  "3d",
  "transitions",
  "sequencing",
  "spring-physics",
  "cinematic-ad",
  "lighting-composition",
  "performance",
  "design-system",
] as const;

// Example skills (complete working code references)
const EXAMPLE_SKILLS = [
  "example-histogram",
  "example-progress-bar",
  "example-text-rotation",
  "example-falling-spheres",
  "example-animated-shapes",
  "example-lottie",
  "example-gold-price-chart",
  "example-typewriter-highlight",
  "example-word-carousel",
] as const;

export const SKILL_NAMES = [...GUIDANCE_SKILLS, ...EXAMPLE_SKILLS] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

// Map guidance skill names to imported content
const guidanceSkillContent: Record<(typeof GUIDANCE_SKILLS)[number], string> = {
  charts: chartsSkill,
  typography: typographySkill,
  "social-media": socialMediaSkill,
  messaging: messagingSkill,
  "3d": threeDSkill,
  transitions: transitionsSkill,
  sequencing: sequencingSkill,
  "spring-physics": springPhysicsSkill,
  "cinematic-ad": cinematicAdSkill,
  "lighting-composition": lightingCompositionSkill,
  performance: performanceSkill,
  "design-system": designSystemSkill,
};

// Map example skill names to example IDs
const exampleIdMap: Record<(typeof EXAMPLE_SKILLS)[number], string> = {
  "example-histogram": "histogram",
  "example-progress-bar": "progress-bar",
  "example-text-rotation": "text-rotation",
  "example-falling-spheres": "falling-spheres",
  "example-animated-shapes": "animated-shapes",
  "example-lottie": "lottie-animation",
  "example-gold-price-chart": "gold-price-chart",
  "example-typewriter-highlight": "typewriter-highlight",
  "example-word-carousel": "word-carousel",
};

export function getSkillContent(skillName: SkillName): string {
  // Handle example skills - return the code directly
  if (skillName.startsWith("example-")) {
    const exampleId =
      exampleIdMap[skillName as (typeof EXAMPLE_SKILLS)[number]];
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      return `## Example: ${example.name}\n${example.description}\n\n\`\`\`tsx\n${example.code}\n\`\`\``;
    }
    return "";
  }

  // Handle guidance skills - return imported markdown content
  return (
    guidanceSkillContent[skillName as (typeof GUIDANCE_SKILLS)[number]] || ""
  );
}

export function getCombinedSkillContent(skills: SkillName[]): string {
  if (skills.length === 0) {
    return "";
  }

  const contents = skills
    .map((skill) => getSkillContent(skill))
    .filter((content) => content.length > 0);

  return contents.join("\n\n---\n\n");
}

export const SKILL_DETECTION_PROMPT = `Classify this motion graphics prompt into ALL applicable categories.
A prompt can match multiple categories. Only include categories that are clearly relevant.

Guidance categories (patterns and rules):
- charts: data visualizations, graphs, histograms, bar charts, pie charts, progress bars, statistics, metrics, numbers, counters
- typography: kinetic text, typewriter effects, text animations, word carousels, animated titles, text-heavy content, headlines
- social-media: Instagram stories, TikTok content, YouTube shorts, social media posts, reels, vertical video, stories
- messaging: chat interfaces, WhatsApp conversations, iMessage, chat bubbles, text messages, DMs, messenger
- 3d: 3D objects, ThreeJS, spatial animations, rotating cubes, 3D scenes, product renders
- transitions: scene changes, fades between clips, slide transitions, wipes, multiple scenes
- sequencing: multiple elements appearing at different times, staggered animations, choreographed entrances, multi-scene
- spring-physics: bouncy animations, organic motion, elastic effects, overshoot animations
- cinematic-ad: product advertisements, commercials, brand videos, sales promotions, marketing content, luxury showcases, product reveals, CTAs, brand intros, promotional content, premium presentations
- lighting-composition: atmospheric scenes, cinematic mood, depth effects, glow effects, gradient backgrounds, layered compositions, vignettes, parallax, premium visual feel
- performance: complex scenes, many elements, particles, 3D, heavy effects, slow loading, optimizations, frame rates, performance budgets
- design-system: brand ads, product ads, luxury, tech, fashion, startup, minimal, corporate, sports, gaming, cohesive design styles, font pairings, color palettes

Code examples (complete working references):
- example-histogram: animated bar chart with spring animations and @remotion/shapes
- example-progress-bar: loading bar animation from 0 to 100%
- example-text-rotation: rotating words with fade/blur transitions
- example-falling-spheres: 3D bouncing spheres with ThreeJS and physics simulation
- example-animated-shapes: bouncing/rotating SVG shapes (circle, triangle, rect, star)
- example-lottie: loading and displaying Lottie animations from URL
- example-gold-price-chart: bar chart with Y-axis labels, monthly data, staggered animations
- example-typewriter-highlight: typewriter effect with cursor blink, pause, and word highlight
- example-word-carousel: rotating words with crossfade and blur transitions

Return a JSON object matching this schema: { "skills": ["category1", "category2"] }. Return an empty array in the "skills" property if none apply. Do not include any other text.`;

export function detectSkillsLocally(prompt: string): SkillName[] {
  const lower = prompt.toLowerCase();
  const matched = new Set<SkillName>();

  const hasAny = (keywords: string[]) => keywords.some(k => lower.includes(k));

  // Guidance Skills
  if (hasAny(["chart", "graph", "histogram", "bar chart", "pie chart", "progress bar", "loading bar", "statistic", "metric", "number", "counter", "visualiz"])) {
    matched.add("charts");
  }
  if (hasAny(["text", "kinetic", "typewrit", "title", "headline", "word", "carousel", "typography"])) {
    matched.add("typography");
  }
  if (hasAny(["instagram", "tiktok", "youtube", "short", "post", "reel", "vertical", "story", "stories"])) {
    matched.add("social-media");
  }
  if (hasAny(["chat", "whatsapp", "imessage", "bubble", "message", "dm", "messenger"])) {
    matched.add("messaging");
  }
  if (hasAny(["3d", "threejs", "three.js", "cube", "sphere", "render", "spatial"])) {
    matched.add("3d");
  }
  if (hasAny(["transition", "fade", "slide transition", "wipe", "scene change", "multi-scene", "scenes"])) {
    matched.add("transitions");
  }
  if (hasAny(["sequence", "stagger", "choreograph", "delay", "timeline", "entrance", "multi-scene", "scenes"])) {
    matched.add("sequencing");
  }
  if (hasAny(["spring", "bounc", "organic", "elastic", "overshoot", "physics"])) {
    matched.add("spring-physics");
  }
  if (hasAny(["ad", "advertisement", "commercial", "brand", "sale", "promot", "marketing", "showcase", "reveal", "cta", "intro", "promo"])) {
    matched.add("cinematic-ad");
  }
  if (hasAny(["atmospher", "cinematic", "mood", "depth", "glow", "gradient", "background", "layer", "vignette", "parallax", "premium", "visual"])) {
    matched.add("lighting-composition");
  }
  if (hasAny(["complex", "particles", "heavy", "loading", "optimiz", "performance", "frame rate", "fps"])) {
    matched.add("performance");
  }
  if (hasAny(["brand", "luxury", "tech", "fashion", "startup", "minimal", "corporate", "sports", "gaming", "palette", "font", "design system"])) {
    matched.add("design-system");
  }

  // Example Skills
  if (hasAny(["histogram"])) {
    matched.add("example-histogram");
  }
  if (hasAny(["progress bar", "loading bar"])) {
    matched.add("example-progress-bar");
  }
  if (hasAny(["text rotation", "rotating words", "rotating text", "rotating word"])) {
    matched.add("example-text-rotation");
  }
  if (hasAny(["falling spheres", "physics simulation", "3d bouncing", "bouncing spheres"])) {
    matched.add("example-falling-spheres");
  }
  if (hasAny(["animated shapes", "svg shapes", "triangle", "star", "circle", "square"])) {
    matched.add("example-animated-shapes");
  }
  if (hasAny(["lottie"])) {
    matched.add("example-lottie");
  }
  if (hasAny(["gold price", "price chart", "monthly data"])) {
    matched.add("example-gold-price-chart");
  }
  if (hasAny(["typewriter", "highlight"])) {
    matched.add("example-typewriter-highlight");
  }
  if (hasAny(["carousel", "word carousel"])) {
    matched.add("example-word-carousel");
  }

  return Array.from(matched);
}
