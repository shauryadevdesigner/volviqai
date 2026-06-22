import { resolveDesignSystem, ResolvedBrief } from "../../design-system";

export function runStage4(brief: any): ResolvedBrief {
  try {
    return resolveDesignSystem(brief);
  } catch (error) {
    console.error(
      "[Stage 4 design resolver failure] falling back to default resolution:",
      error,
    );
    return resolveDesignSystem({
      template: "Luxury Reveal",
      colorPalette: "Midnight Royal",
      sceneCount: 4,
      audienceProfile: { audience: "General Audience", age_range: "18-54" },
      strategy: {
        core_emotion: "Trust",
        emotional_rationale: "Default design style",
      },
      storyboard: brief?.storyboard || [],
    });
  }
}
