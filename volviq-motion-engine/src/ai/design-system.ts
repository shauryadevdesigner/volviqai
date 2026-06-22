import visualBenchmarksData from "../data/visual-benchmarks.json";

// ============================================================================
// Volviq Premium Motion Graphics V4 — Design System Layer
// ============================================================================

export interface ColorPaletteConfig {
  bg: string;
  text: string;
  accent: string;
  glow: string;
}

export const COLOR_PALETTES: Record<string, ColorPaletteConfig> = {
  "Midnight Royal": {
    bg: "#0b0f19",
    text: "#f8fafc",
    accent: "#38bdf8",
    glow: "#0ea5e9"
  },
  "Cyber Neon": {
    bg: "#09090b",
    text: "#fafafa",
    accent: "#a855f7",
    glow: "#6366f1"
  },
  "Sunset Editorial": {
    bg: "#1a0f1a",
    text: "#fdfbf7",
    accent: "#ff7e67",
    glow: "#fda4af"
  },
  "Minimal Slate": {
    bg: "#0f172a",
    text: "#f1f5f9",
    accent: "#2563eb",
    glow: "#3b82f6"
  },
  "Luxury Gold": {
    bg: "#0d0a07",
    text: "#fdfaf2",
    accent: "#d4af37",
    glow: "#f59e0b"
  },
  "Monochrome Premium": {
    bg: "#18181b",
    text: "#fafafa",
    accent: "#71717a",
    glow: "#a1a1aa"
  },
  "Tech Sapphire": {
    bg: "#020617",
    text: "#f8fafc",
    accent: "#2563eb",
    glow: "#60a5fa"
  },
  "Crimson Luxury": {
    bg: "#1c0a10",
    text: "#fff5f7",
    accent: "#e11d48",
    glow: "#fda4af"
  }
};

export interface DesignPackConfig {
  packName: string;
  fonts: {
    heroFont: string;
    secondaryFont: string;
    accentFont: string;
  };
  spring: {
    damping: number;
    stiffness: number;
  };
}

export const DESIGN_PACKS: Record<string, DesignPackConfig> = {
  "Luxury Pack": {
    packName: "Luxury Pack",
    fonts: {
      heroFont: "Clash Display",
      secondaryFont: "General Sans",
      accentFont: "Cormorant Garamond"
    },
    spring: { damping: 28, stiffness: 120 }
  },
  "Tech Pack": {
    packName: "Tech Pack",
    fonts: {
      heroFont: "Space Grotesk",
      secondaryFont: "Inter",
      accentFont: "Playfair Display"
    },
    spring: { damping: 20, stiffness: 180 }
  },
  "Cyber Pack": {
    packName: "Cyber Pack",
    fonts: {
      heroFont: "Bebas Neue",
      secondaryFont: "Poppins",
      accentFont: "Dancing Script"
    },
    spring: { damping: 14, stiffness: 220 }
  },
  "Corporate Pack": {
    packName: "Corporate Pack",
    fonts: {
      heroFont: "Montserrat ExtraBold",
      secondaryFont: "Inter",
      accentFont: "Playfair Display"
    },
    spring: { damping: 26, stiffness: 140 }
  },
  "Editorial Pack": {
    packName: "Editorial Pack",
    fonts: {
      heroFont: "Clash Display",
      secondaryFont: "Poppins",
      accentFont: "Cormorant Garamond"
    },
    spring: { damping: 24, stiffness: 150 }
  },
  "Startup Pack": {
    packName: "Startup Pack",
    fonts: {
      heroFont: "Satoshi",
      secondaryFont: "Plus Jakarta Sans",
      accentFont: "Great Vibes"
    },
    spring: { damping: 22, stiffness: 160 }
  }
};

// Map template string to a Design Pack
export function getPackForTemplate(template: string): DesignPackConfig {
  switch (template) {
    case "Luxury Reveal":
    case "Premium Product Spotlight":
      return DESIGN_PACKS["Luxury Pack"];
    case "Tech Product Launch":
    case "App Promo":
    case "Futuristic Brand Campaign":
      return DESIGN_PACKS["Tech Pack"];
    case "Bold Kinetic Typography":
      return DESIGN_PACKS["Cyber Pack"];
    case "Corporate Presentation":
      return DESIGN_PACKS["Corporate Pack"];
    case "E-Commerce Showcase":
    case "Social Media Promo":
    case "Motion Graphics Reel":
      return DESIGN_PACKS["Editorial Pack"];
    case "SaaS Promo":
    case "Startup Launch":
    default:
      return DESIGN_PACKS["Startup Pack"];
  }
}

export interface ResolvedScene {
  sceneNumber: number;
  purpose: string;
  hookElement: string;
  copyText: string;
  subtext?: string;
  accentText?: string;
  time_start_pct: number;
  time_end_pct: number;
  
  // Design System additions (resolved programmatically)
  typography: {
    heroFont: string;
    secondaryFont: string;
    accentFont: string;
    letterSpacing?: string;
    lineHeight?: string;
    textShadow?: string;
  };
  layout: {
    direction: string;
    textHierarchy: string;
    ctaPlacement: string;
    compositionStyle: string;
    depthLayers: number;
    cardOpacity?: number;
    cardBorderWidth?: number;
  };
  motion: {
    motionStyle: string;
    transitionFamily: string;
    cameraStyle: string;
    energyLevel: string;
    damping?: number;
    stiffness?: number;
  };
  ctaDesign?: {
    reflectionDuration: number;
    hoverScale: number;
    shadowGlow: string;
  };
  visualTreatment: {
    background: string;
    assetRequirement: string;
    transition: string;
  };
  assetStrategy: {
    requiresAssets: boolean;
    assetType: string;
    assetCount: number;
    style: string;
    prompt: string;
    placement: string;
    animationRole: string;
    imageUrl?: string;
  };
}

export interface ResolvedBrief {
  template: string;
  colorPalette: string;
  packName: string;
  colors: ColorPaletteConfig;
  spring: {
    damping: number;
    stiffness: number;
  };
  spacing?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  audienceProfile: {
    audience: string;
    age_range: string;
  };
  strategy: {
    core_emotion: string;
    emotional_rationale: string;
  };
  scenes: ResolvedScene[];
}

/**
 * Resolves a brief generated by the LLM (which has minimal properties) into
 * a full set of visual and motion properties to guide code generation.
 */
export function getCategoryForTemplate(template: string): string {
  switch (template) {
    case "Luxury Reveal":
    case "Premium Product Spotlight":
      return "Luxury";
    case "Tech Product Launch":
    case "App Promo":
    case "Futuristic Brand Campaign":
      return "Technology";
    case "Corporate Presentation":
      return "Corporate";
    case "Bold Kinetic Typography":
      return "Social Media";
    case "E-Commerce Showcase":
      return "Product Advertising";
    case "Motion Graphics Reel":
    case "Social Media Promo":
      return "Social Media";
    case "Editorial Pack":
    case "Sunset Editorial":
      return "Editorial";
    case "SaaS Promo":
    case "Startup Launch":
    default:
      return "Startup";
  }
}

/**
 * Resolves a brief generated by the LLM (which has minimal properties) into
 * a full set of visual and motion properties to guide code generation.
 */
export function resolveDesignSystem(brief: any): ResolvedBrief {
  const template = brief.template || "SaaS Promo";
  const paletteName = brief.colorPalette || "Midnight Royal";
  
  const colors = COLOR_PALETTES[paletteName] || COLOR_PALETTES["Midnight Royal"];
  const pack = getPackForTemplate(template);

  // Load visual benchmark pattern config
  const category = getCategoryForTemplate(template);
  const benchmark = (visualBenchmarksData as any)[category] || (visualBenchmarksData as any)["Startup"];

  const rawStoryboard = brief.storyboard || [];
  
  const resolvedScenes: ResolvedScene[] = rawStoryboard.map((scene: any, idx: number) => {
    const motionStyle = scene.motion?.motionStyle || benchmark.motion.motionStyle || "kinetic_typography";
    const energyLevel = scene.motion?.energyLevel || benchmark.motion.energyLevel || "medium";
    const layoutDirection = scene.layout?.direction || benchmark.layout.direction || "centered";
    const ctaPlacement = scene.layout?.ctaPlacement || "none";

    const heroFont = benchmark.typography.heroFont || pack.fonts.heroFont;
    const secondaryFont = benchmark.typography.secondaryFont || pack.fonts.secondaryFont;
    const accentFont = benchmark.typography.accentFont || pack.fonts.accentFont;

    const compositionStyle = benchmark.layout.compositionStyle || "hero_center";
    const depthLayers = benchmark.layout.depthLayers || 2;
    const transitionFamily = benchmark.transitions.family || "morph";
    const cameraStyle = benchmark.motion.cameraStyle || "push_in";

    // Build Layout Text Hierarchy description
    let textHierarchy = `Hero Font (${heroFont}) centered`;
    if (layoutDirection === "split-left") {
      textHierarchy = "Hero Font on left, Secondary Font paragraph below it";
    } else if (layoutDirection === "split-right") {
      textHierarchy = "Secondary Font paragraph on left, Hero Font title on right";
    } else if (scene.accent_text) {
      textHierarchy = "Accent Font category at top, Hero Font title center, Secondary Font subtitle below";
    }

    // Build Background visual treatment description
    let background = "Cinematic radial gradient matching palette base";
    if (category === "Luxury") {
      background = "Deep vignette luxury ambient black with gold drifting radial glows";
    } else if (category === "Technology" || category === "Social Media") {
      background = "Cyberpunk glowing grid base with blue/cyan shifting radial glow shapes";
    } else if (category === "Startup" || category === "Product Advertising") {
      background = "Modern SaaS smooth background with soft colorful moving glow blobs";
    }

    return {
      sceneNumber: scene.sceneNumber || (idx + 1),
      purpose: scene.purpose || "Deliver message",
      hookElement: scene.hookElement || "Dynamic typography reveal",
      copyText: scene.copy_text || "",
      subtext: scene.subtext,
      accentText: scene.accent_text,
      time_start_pct: scene.time_start_pct !== undefined ? scene.time_start_pct : Math.round((idx / rawStoryboard.length) * 100),
      time_end_pct: scene.time_end_pct !== undefined ? scene.time_end_pct : Math.round(((idx + 1) / rawStoryboard.length) * 100),
      
      typography: {
        heroFont,
        secondaryFont,
        accentFont,
        letterSpacing: benchmark.typography.letterSpacing,
        lineHeight: benchmark.typography.lineHeight,
        textShadow: benchmark.typography.textShadow
      },
      layout: {
        direction: layoutDirection,
        textHierarchy,
        ctaPlacement,
        compositionStyle,
        depthLayers,
        cardOpacity: benchmark.layout.cardOpacity,
        cardBorderWidth: benchmark.layout.cardBorderWidth
      },
      motion: {
        motionStyle,
        transitionFamily,
        cameraStyle,
        energyLevel,
        damping: benchmark.motion.damping,
        stiffness: benchmark.motion.stiffness
      },
      ctaDesign: benchmark.ctaDesign,
      visualTreatment: {
        background,
        assetRequirement: scene.assetStrategy?.assetType || "none",
        transition: `Staged transition using ${transitionFamily} easing into next sequence`
      },
      assetStrategy: {
        requiresAssets: scene.assetStrategy?.requiresAssets || false,
        assetType: scene.assetStrategy?.assetType || "none",
        assetCount: scene.assetStrategy?.assetCount || 0,
        style: scene.assetStrategy?.style || "SaaS",
        prompt: scene.assetStrategy?.prompt || "",
        placement: scene.assetStrategy?.placement || "center",
        animationRole: scene.assetStrategy?.animationRole || "supporting",
        imageUrl: scene.assetStrategy?.imageUrl
      }
    };
  });

  return {
    template,
    colorPalette: paletteName,
    packName: pack.packName,
    colors,
    spring: {
      damping: benchmark.motion.damping,
      stiffness: benchmark.motion.stiffness
    },
    spacing: benchmark.spacing,
    audienceProfile: {
      audience: brief.audienceProfile?.audience || "General",
      age_range: brief.audienceProfile?.age_range || "18-54"
    },
    strategy: {
      core_emotion: brief.strategy?.core_emotion || "Trust",
      emotional_rationale: brief.strategy?.emotional_rationale || "Polished corporate layout and animations build trust."
    },
    scenes: resolvedScenes
  };
}
