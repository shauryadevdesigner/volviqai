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

  return `GENERATION MODE: AD — HIGH-CONVERTING CINEMATIC COMMERCIAL
- Render exactly ${durationInFrames} frames at ${fps} FPS (${seconds} seconds).
- Do NOT use 3D elements (Canvas, Three.js). Use 2D HTML/CSS & Pre-built Commercial Primitives only.

════════════════════════════════════════════════════════════
## MANDATORY 6-BEAT COMMERCIAL AD RHYTHM
════════════════════════════════════════════════════════════

Structure the advertisement into these exact 6 commercial beats:
Beat 1 — HOOK (0%–15%): Arresting visual surprise (light sweep, zoom burst, or shockwave ring). Render <AdHookBanner text="..." /> at top.
Beat 2 — CURIOSITY & PROBLEM (15%–30%): Slow push-in camera. Headline uses <KineticHeadline title="..." subtitle="..." /> with character 3D flip.
Beat 3 — PRODUCT REVEAL (30%–55%): Hero product/value enters inside <ProductGlassCard badgeText="..."> with floating spec badges.
Beat 4 — VALUE SHOWCASE (55%–75%): Render <FeatureGrid items={...} /> or staggered glass cards showcasing top benefits.
Beat 5 — SIGNATURE CLIMAX (75%–88%): THE UNFORGETTABLE MOMENT. Use <LightBeam />, <TextReveal />, or SVG morph shape explosions.
Beat 6 — CTA & URGENCY (88%–100%): Render high-converting <AdCTAButton label="..." /> accompanied by <UrgencyTimer startSeconds={15} />.

════════════════════════════════════════════════════════════
## MANDATORY PRE-BUILT COMMERCIAL PRIMITIVES (USE THESE)
════════════════════════════════════════════════════════════

You have direct access to these high-converting commercial components (DO NOT define or import them, use directly):
1. <KineticHeadline title="Title" subtitle="Subtitle" accentColor="#38bdf8" delay={0} />
   - 3D Y-axis character flip reveal, blur clearing, scale overshoot, and multi-stop gradient fill.
2. <ProductGlassCard title="Title" badgeText="OFFER" accentColor="#38bdf8" delay={10}>...</ProductGlassCard>
   - Elevated glass container for hero product images/renders with glowing borders and floating pills.
3. <AdHookBanner text="LIMITED OFFER" accentColor="#38bdf8" delay={0} />
   - Animated category/hook badge with glowing neon border and smooth entrance.
4. <AdCTAButton label="GET STARTED NOW" accentColor="#ff3366" delay={30} />
   - High-conversion pulsing action button with diagonal shine sweep overlays and glow ring.
5. <UrgencyTimer startSeconds={15} delay={0} accentColor="#ff3366" />
   - Animated countdown counter with pulsing glow for final ad frames.
6. <CinematicScene cameraPushIn={true}>...</CinematicScene>
   - Wraps scenes with camera dolly, film grain, vignette, and color grade.

════════════════════════════════════════════════════════════
## VISUAL QUALITY MANDATES
════════════════════════════════════════════════════════════
- HUGE READABLE TEXT SCALE: Headlines = 140px–200px, Subtitles = 64px–90px, Body = 48px–64px, Labels/Badges = 36px–48px. MINIMUM FONT SIZE FOR ANY TEXT IS 36px. Never generate small text under 36px.
- NO PLAIN UNSTYLED TEXT: Headlines MUST use <KineticHeadline> or <TextReveal>. Body text MUST be inside a <GlassCard> or <ProductGlassCard>.
- MULTI-LAYER DEPTH: 5 layers minimum (z=0 bg, z=1 atmosphere, z=2 light beams, z=10 content, z=20 particles).
- PARTICLES: Include 20+ floating particles in dual orbits (sin/cos drift).
- SPRING PHYSICS: Use spring() with overshoot (damping 12-16, stiffness 180-240) for all entrances. NO linear interpolation for entrances.`;
}
