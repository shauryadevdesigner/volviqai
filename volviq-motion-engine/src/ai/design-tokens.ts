// ============================================================================
// Volviq Premium Motion Graphics V4 — Design Tokens
// ============================================================================

/**
 * Premium Spring Physics Configurations.
 */
export const SPRINGS = {
  luxury: { damping: 28, stiffness: 120 },     // Gentle, buttery smooth, slow
  tech: { damping: 20, stiffness: 180 },       // Snappy, precise, responsive
  cyber: { damping: 14, stiffness: 220 },      // Energetic, elastic, bounce
  corporate: { damping: 26, stiffness: 140 },  // Restrained, premium, professional
  editorial: { damping: 24, stiffness: 150 },  // Flowing, editorial, balanced
  startup: { damping: 22, stiffness: 160 },    // Friendly, organic, active
};

/**
 * Semantic Grid Layout Spacing.
 */
export const SPACING = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 64,
  xl: 120,
};

/**
 * Border Radii for Cards, Panels, and Buttons.
 */
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};

/**
 * Ambient Box Shadows.
 */
export const SHADOWS = {
  soft: "0 4px 12px rgba(0, 0, 0, 0.05)",
  medium: "0 8px 24px rgba(0, 0, 0, 0.1)",
  strong: "0 16px 48px rgba(0, 0, 0, 0.2)",
  luxury: "0 24px 64px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
};

/**
 * Premium Atmospheric Glows and Radial Overlays.
 */
export const GLOWS = {
  premium: {
    blur: 60,
    opacity: 0.35,
    mixBlendMode: "screen" as const,
  },
  intense: {
    blur: 80,
    opacity: 0.5,
    mixBlendMode: "screen" as const,
  },
  ambient: {
    blur: 120,
    opacity: 0.2,
    mixBlendMode: "color-dodge" as const,
  },
};

/**
 * Blur Presets for Glassmorphism.
 */
export const BLURS = {
  sm: "blur(4px)",
  md: "blur(8px)",
  lg: "blur(16px)",
  glass: "blur(20px) saturate(180%)",
};
