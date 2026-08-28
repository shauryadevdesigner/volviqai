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

  return `GENERATION MODE: AD
- Render exactly ${durationInFrames} frames at ${fps} FPS (${seconds} seconds). This format overrides any duration mentioned in the user's initial prompt.
- Create a promotional video for startups, founders, or ecommerce brands.
- Build multiple purposeful beats across the duration: a strong hook, product or offer storytelling, clear benefits, brand hierarchy, and a convincing call to action.
- Maintain narrative progression and a composed ending; this video is not required to loop.`;
}
