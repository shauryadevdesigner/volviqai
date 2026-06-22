// ============================================================================
// Volviq AI Orchestrator — Data Contracts & Types
// ============================================================================

export interface IntentData {
  type:
    | "ad"
    | "product_launch"
    | "explainer"
    | "kinetic_typography"
    | "saas_promo"
    | "luxury_reveal"
    | "corporate"
    | "brand_film"
    | "social";
  audience: string;
  platform:
    | "tiktok"
    | "youtube_shorts"
    | "instagram_reels"
    | "linkedin"
    | "web"
    | "desktop";
  industry: string;
  durationSeconds: number;
  emotionalGoal: string;
  conversionGoal: string;
  complexity: "low" | "medium" | "high";
}

export interface CreativeBrief {
  campaignStrategy: string;
  emotionalPositioning: string;
  hookDescription: string;
  narrativeArc: string;
  conversionPsychology: string;
  brandVoiceGuidance: string;
}

export interface MarketingStrategy {
  hooks: string[];
  headlineCopy: string[];
  subheadlineCopy: string[];
  ctaCopy: string;
  persuasionStructure: "AIDA" | "PAS" | "StoryBrand" | "Hormozi";
  benefitStatements: string[];
}

export interface StoryboardScene {
  sceneNumber: number;
  purpose: string;
  headline: string;
  subheadline: string;
  visualDirection: string;
  emotion: string;
  transition: "fade" | "slide" | "wipe" | "flip" | "clockWipe" | "none";
  motionStyle: string;
  energy: "low" | "medium" | "high";
}

export interface Storyboard {
  scenes: StoryboardScene[];
}

export interface ResolvedDesignSystem {
  heroFont: string;
  secondaryFont: string;
  accentFont: string;
  colors: { bg: string; text: string; accent: string; glow: string };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  shadows: { soft: string; medium: string; strong: string; luxury: string };
  glows: { premium: any; intense: any; ambient: any };
  transitions: string[];
  cameraStyle: string;
}

export interface AssetPlanScene {
  sceneNumber: number;
  requiresAssets: boolean;
  assetType:
    | "product_render"
    | "editorial_scene"
    | "background_illustration"
    | "device_mockup"
    | "abstract_graphic"
    | "luxury_photo"
    | "character"
    | "none";
  placement: "fullscreen" | "left" | "right" | "center" | "floating" | "background" | "none";
  prompt: string;
  animationRole: "hero" | "supporting" | "ambient" | "none";
}

export interface AssetPlan {
  scenes: AssetPlanScene[];
}

export interface GeneratedAssetItem {
  imageUrl: string;
  isFallbackSvg: boolean;
}

export interface GeneratedAssets {
  sceneAssets: Record<number, GeneratedAssetItem>;
}

export interface SceneLayoutItem {
  sceneNumber: number;
  compositionStyle: "split" | "editorial" | "asymmetric" | "bento" | "layered_depth";
  canvasUtilizationPct: number; // target >= 95%
  elementCoords: Record<string, string>;
}

export interface SceneLayouts {
  layouts: SceneLayoutItem[];
}

export interface GeneratedCode {
  rawCode: string;
}

export interface CodeValidationResult {
  isValid: boolean;
  fixedCode: string;
  repairsApplied: string[];
}

export interface AuditScore {
  scores: {
    typography: number;
    visualHierarchy: number;
    motionQuality: number;
    premiumAppearance: number;
    brandConsistency: number;
    conversionEffectiveness: number;
    composition: number;
    codeQuality: number;
  };
  averageScore: number; // required >= 90
  critique: string[];
}

export interface CompileResult {
  success: boolean;
  errors: string[];
}

export interface AutoRepairResult {
  code: string;
  summary: string;
}

export interface CreativeMemoryEntry {
  prompt: string;
  audience: string;
  emotion: string;
  template?: string;
  colorPalette?: string;
  storyboard: any[];
  finalScore: number;
  timestamp: string;
}
