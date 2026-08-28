import { ALL_TEMPLATES, type TemplateCard } from "@/data/recommended-templates";
import type { UserProfile } from "@/types/profile";

export function getRecommendations(profile: UserProfile | null): TemplateCard[] {
  if (!profile) return ALL_TEMPLATES.slice(0, 4);

  const scored = ALL_TEMPLATES.map((t) => {
    let score = 0;
    const goals = Array.isArray(profile.goals) ? profile.goals : [];

    if (
      goals.some((g) => g.includes("Motion") || g.includes("Marketing")) &&
      t.tags.includes("motion")
    ) {
      score += 3;
    }
    if (
      goals.some((g) => g.includes("Product") || g.includes("Advertisement")) &&
      t.tags.includes("product")
    ) {
      score += 3;
    }
    if (
      (goals.some((g) => g.includes("Reel") || g.includes("Instagram")) ||
        profile.platform === "Instagram" ||
        profile.platform === "TikTok") &&
      t.aspect === "vertical"
    ) {
      score += 3;
    }
    if (profile.business_type === "Startup" && t.tags.includes("startup")) {
      score += 2;
    }
    if (profile.platform === "YouTube" && t.tags.includes("youtube")) {
      score += 2;
    }

    return { template: t, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.template)
    .slice(0, 5);
}

export function getExamplePrompts(profile: UserProfile | null): string[] {
  const defaults = [
    "Create a luxury product advertisement",
    "Generate a 20-second motion graphic ad",
    "Create an Instagram reel for my startup",
    "Generate a Black Friday promotion video",
  ];

  if (!profile) return defaults;

  const personalized: string[] = [];
  const goals = Array.isArray(profile.goals) ? profile.goals : [];

  if (goals.some((g) => g.includes("Product"))) {
    personalized.push("Create a premium product showcase with cinematic motion");
  }
  if (goals.some((g) => g.includes("Reel"))) {
    personalized.push(
      `Create a ${profile.platform || "Instagram"} reel with bold kinetic text`,
    );
  }
  if (profile.business_type === "Startup") {
    personalized.push("Generate a startup launch video with energetic typography");
  }
  if (goals.some((g) => g.includes("Motion"))) {
    personalized.push("Design a motion graphic ad with smooth spring animations");
  }

  return Array.from(new Set([...personalized, ...defaults])).slice(0, 5);
}
