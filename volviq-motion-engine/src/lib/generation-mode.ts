import {
  GENERATION_MODE_PRESETS,
  type GenerationMode,
} from "@/types/generation";

export function normalizeGenerationMode(value: unknown): GenerationMode {
  if (value === "motion_asset") return "motion_asset";
  if (value === "3d") return "3d";
  return "ad";
}

export function resolveGenerationFormat(input: {
  mode: GenerationMode;
  isFollowUp: boolean;
  fps?: number;
  durationInFrames?: number;
}) {
  const preset = GENERATION_MODE_PRESETS[input.mode];
  const validFps = Number.isFinite(input.fps) && (input.fps ?? 0) > 0;
  const validDuration =
    Number.isFinite(input.durationInFrames) && (input.durationInFrames ?? 0) > 0;

  return {
    fps: input.isFollowUp && validFps ? Math.round(input.fps!) : preset.fps,
    durationInFrames:
      input.isFollowUp && validDuration
        ? Math.round(input.durationInFrames!)
        : preset.durationInFrames,
    loop: input.mode === "motion_asset" || input.mode === "3d",
  };
}

export function getGenerationModeDirective(
  mode: GenerationMode,
  fps: number,
  durationInFrames: number,
): string {
  const seconds = durationInFrames / fps;
  if (mode === "motion_asset") {
    return `GENERATION MODE: MOTION GRAPHIC ASSET
- Render exactly ${durationInFrames} frames at ${fps} FPS (${seconds} seconds). This format overrides any duration mentioned in the user's initial prompt.
- Create a reusable, full-frame, opaque motion design asset for editors using CapCut, Premiere Pro, or similar software.
- It MUST loop seamlessly: the visual state at the end must match the opening state, including positions, scale, rotation, colors, opacity, and background.
- Prefer periodic motion derived from frame / durationInFrames (sin/cos or equivalent cycle math). Do not use one-way intro/outro animation that snaps at the loop boundary.
- Use balanced full-frame composition and purposeful abstract or prompt-specific motion.
- Do not force advertising copy, product benefits, testimonials, hooks, story arcs, logos, or calls to action unless explicitly requested.`;
  }

  if (mode === "3d") {
    return `GENERATION MODE: 3D ANIMATION
- Render exactly ${durationInFrames} frames at ${fps} FPS (${seconds} seconds). This format overrides any duration mentioned in the user's initial prompt.
- Create a stunning 3D animation using @react-three/fiber and @react-three/drei (both are installed).
- CRITICAL: Wrap the entire component in <Canvas> from @react-three/fiber. The Canvas must be inside the component function.
- CRITICAL: Do NOT use useFrame from @react-three/fiber. Use Remotion's useCurrentFrame() to get the current frame and calculate animations manually.
- CRITICAL: Do NOT use useThree from @react-three/fiber. Use Remotion's useVideoConfig() for dimensions.
- CRITICAL: Do NOT use HTML elements (div, span, p) inside Canvas - use 3D elements only (mesh, geometries, materials).
- Use Float from @react-three/drei for floating animations (wrap shapes in <Float>).
- Include lighting: ambientLight, directionalLight, pointLight, spotLight.
- Add floating 3D shapes: icosahedronGeometry, torusGeometry, sphereGeometry, boxGeometry.
- Add Stars and Sparkles for particle effects in the background.
- Use MeshDistortMaterial or MeshWobbleMaterial for organic, animated surfaces.
- Include OrbitControls with autoRotate for continuous camera movement.
- Add 3D text using Text3D component when text is needed.
- Use ContactShadows for grounding elements.
- Use Environment preset for reflections (city, sunset, night, studio).
- Calculate animations based on frame: const frame = useCurrentFrame(); const progress = frame / durationInFrames;
- Available: FiberCanvas (as Canvas), Stars, Sparkles, Float, OrbitControls, Environment, Text3D, Center, MeshDistortMaterial, MeshWobbleMaterial, RoundedBox, ContactShadows, AccumulativeShadows from @react-three/drei; useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill from remotion.`;
  }

  return `GENERATION MODE: AD — PREMIUM CINEMATIC COMMERCIAL
- Render exactly ${durationInFrames} frames at ${fps} FPS (${seconds} seconds).

## CREATIVE DIRECTION
You MUST generate a unique creative concept for this ad. Do NOT repeat the same layout/structure as previous generations. Each ad should feel like it was designed by a different creative agency.

## VISUAL STYLE (choose one randomly each generation):
- Minimalist luxury: Clean whitespace, single focal point, subtle motion
- Maximalist energy: Dense compositions, multiple focal points, high-energy motion
- Retro-futuristic: Neon grids, chrome textures, synthwave aesthetics
- Organic flow: Curved shapes, natural gradients, fluid motion
- Geometric precision: Sharp angles, grid-based layout, mathematical motion
- Editorial magazine: Typography-driven, column layouts, elegant reveals

## COLOR PALETTE (generate unique per ad):
Do NOT default to blue/purple. Generate a unique palette for each ad:
- Warm: Gold/amber + deep burgundy + cream
- Cool: Teal/cyan + navy + silver
- Bold: Electric coral + deep purple + white
- Natural: Forest green + warm sand + earth brown
- Monochromatic: Single hue with varying saturation/brightness
- Complementary: Two opposing hues with neutral accents

## CINEMATIC TECHNIQUES (use at least 3):
- Rack focus: Blur shifts between depth layers
- Lens flare: Bright light source with streak overlay
- Film grain: Subtle animated noise overlay (opacity 0.03-0.05)
- Light leak: Warm color bleed from edges
- Anamorphic bokeh: Oval-shaped background blur
- Chromatic aberration: RGB channel split on edges
- Vignette: Darkened edges with radial gradient
- Whip pan: Fast motion blur transition
- Zoom burst: Rapid scale with radial lines
- Shape morphing: One shape transforms into another

## TYPOGRAPHY (dramatic and varied):
- Mix font weights: Ultra-thin + ultra-bold contrasts
- Kinetic type: Words animate in with spring physics, not fades
- Text masking: Reveal text through moving shapes
- Variable size: 140px+ headlines, 60px+ subtitles
- Letter animation: Individual letters stagger in with rotation/scale
- Text path: Text follows a curved or diagonal path

## COMPOSITION (varied layouts):
- Asymmetric: Off-center focal point with negative space
- Split-screen: Two contrasting halves that merge
- Radial: Elements emanate from center
- Diagonal: Dynamic 30-45 degree angles
- Layered parallax: 5+ depth layers at different speeds
- Frame-in-frame: Nested containers with different motion

## STORYTELLING ARC:
1. Hook (0-12%): Bold visual surprise — unexpected motion or reveal
2. Intrigue (12-25%): Slow down, build curiosity with subtle motion
3. Reveal (25-45%): Product/concept entrance with dramatic timing
4. Showcase (45-70%): Features with staggered, varied reveals
5. Climax (70-85%): Biggest visual moment — full energy
6. CTA (85-100%): Clear action with pulsing urgency

## IMPORTANT:
- Do NOT use 3D elements (Canvas, Three.js, @react-three/fiber, @react-three/drei). Use 2D HTML/CSS only.
- Each generation MUST look different — vary colors, layout, motion style, and composition.
- Think like a creative director at a top agency: every ad should feel unique and intentional.`;
}
