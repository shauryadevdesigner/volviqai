// ============================================================================
// Visual Enhancer — Post-generation transformation engine
// ============================================================================
// Takes ANY generated Remotion code and automatically injects cinematic
// visual effects to guarantee flashy, premium output regardless of AI quality.
// ============================================================================

/**
 * Injects cinematic enhancements into generated Remotion code:
 * - Animated gradient background with pulsing glows
 * - Floating particles with glow effects
 * - Camera dolly/zoom movement
 * - Spring-based entrance animations
 * - Ambient light streaks
 * - Dynamic shadows and depth layers
 */
export function enhanceVisuals(code: string): string {
  // Skip if already enhanced
  if (code.includes('__ENHANCED__')) return code;

  const animationState = generateAnimationState();
  const backgroundCode = generateAnimatedBackground();
  const particlesCode = generateFloatingParticles();
  const lightStreaksCode = generateLightStreaks();
  const cameraCode = generateCameraMovement();

  // Inject animation state variables after imports
  const lines = code.split('\n');
  let insertIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].trim().startsWith('//') || lines[i].trim() === '') {
      insertIdx = i + 1;
    } else {
      break;
    }
  }

  // Inject the camera transform wrapper and visual layers
  const enhancedLines = [
    ...lines.slice(0, insertIdx),
    '',
    '// __ENHANCED__ Auto-injected cinematic enhancements',
    animationState,
    '',
    '// Camera movement hook',
    cameraCode,
    '',
    ...lines.slice(insertIdx),
  ];

  let enhanced = enhancedLines.join('\n');

  // Wrap the return JSX with enhanced layers
  enhanced = wrapWithVisualLayers(enhanced, backgroundCode, particlesCode, lightStreaksCode);

  return enhanced;
}

function generateAnimationState(): string {
  return `// Cinematic animation state
const _globalSpring = spring({ frame: frame - 0, fps, config: SPRINGS.luxury });
const _entranceProgress = interpolate(_globalSpring, [0, 1], [0, 1]);
const _bgPulse = 0.2 + Math.sin(frame * 0.02) * 0.08;
const _glowIntensity = 0.3 + Math.sin(frame * 0.025) * 0.1;`;
}

function generateCameraMovement(): string {
  return `// Camera dolly + parallax
const _camZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const _parallaxBg = interpolate(frame, [0, durationInFrames], [0, -25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const _parallaxFg = interpolate(frame, [0, durationInFrames], [0, -70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });`;
}

function generateAnimatedBackground(): string {
  return `{(() => {
  const hue = interpolate(frame, [0, durationInFrames], [220, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: \`hsl(\${hue}, 60%, 5%)\`, zIndex: 0 }}>
      <div style={{ position: "absolute", width: "80%", height: "80%", left: "10%", top: "10%", borderRadius: "50%", background: \`radial-gradient(circle, hsla(\${hue + 40}, 80%, 30%, \${_bgPulse}) 0%, transparent 70%)\`, filter: "blur(80px)", transform: \`translate(\${_parallaxBg}px, \${_parallaxBg * 0.5}px)\` }} />
      <div style={{ position: "absolute", width: "60%", height: "60%", right: "5%", bottom: "10%", borderRadius: "50%", background: \`radial-gradient(circle, hsla(\${hue + 80}, 70%, 25%, \${_bgPulse * 0.8}) 0%, transparent 70%)\`, filter: "blur(100px)", transform: \`translate(\${_parallaxBg * -0.7}px, \${_parallaxBg * 0.3}px)\` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.5) 100%)", zIndex: 1 }} />
    </AbsoluteFill>
  );
})()}`;
}

function generateFloatingParticles(): string {
  return `{(() => {
  return (
    <AbsoluteFill style={{ zIndex: 2, pointerEvents: "none" }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const px = Math.sin(frame * 0.015 + i * 0.9) * (120 + i * 15);
        const py = Math.cos(frame * 0.012 + i * 0.7) * (80 + i * 10);
        const size = 3 + Math.sin(frame * 0.04 + i) * 2;
        const opacity = 0.2 + Math.sin(frame * 0.03 + i * 0.5) * 0.15;
        const hue = 200 + i * 12;
        return (
          <div key={\`p\${i}\`} style={{ position: "absolute", left: \`calc(50% + \${px}px)\`, top: \`calc(50% + \${py}px)\`, width: size, height: size, borderRadius: "50%", background: \`hsla(\${hue}, 80%, 70%, \${opacity})\`, boxShadow: \`0 0 \${size * 3}px hsla(\${hue}, 80%, 60%, \${opacity * 0.8})\`, filter: "blur(0.5px)", transform: \`translate(\${_parallaxFg * (0.3 + i * 0.05)}px, 0)\` }} />
        );
      })}
    </AbsoluteFill>
  );
})()}`;
}

function generateLightStreaks(): string {
  return `{(() => {
  return (
    <AbsoluteFill style={{ zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "2px", height: "40%", left: \`\${30 + Math.sin(frame * 0.01) * 15}%\`, top: "30%", background: \`linear-gradient(180deg, transparent, rgba(56,189,248,\${_glowIntensity * 0.4}), transparent)\`, transform: \`rotate(\${15 + Math.sin(frame * 0.008) * 5}deg)\`, filter: "blur(1px)" }} />
      <div style={{ position: "absolute", width: "1px", height: "30%", right: \`\${25 + Math.cos(frame * 0.012) * 10}%\`, top: "35%", background: \`linear-gradient(180deg, transparent, rgba(168,85,247,\${_glowIntensity * 0.3}), transparent)\`, transform: \`rotate(\${-20 + Math.cos(frame * 0.009) * 5}deg)\`, filter: "blur(1px)" }} />
    </AbsoluteFill>
  );
})()}`;
}

function wrapWithVisualLayers(code: string, background: string, particles: string, lightStreaks: string): string {
  // Find the return statement and wrap its JSX
  const returnMatch = code.match(/return\s*\(([\s\S]*?)\);?\s*\}\s*export/);
  if (!returnMatch) return code;

  const wrappedJsx = `<AbsoluteFill style={{ transform: \`scale(\${_camZoom})\`, overflow: "hidden" }}>
      ${background}
      ${lightStreaks}
      <AbsoluteFill style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {returnMatch[1]}
      </AbsoluteFill>
      ${particles}
    </AbsoluteFill>`;

  return code.replace(returnMatch[1], wrappedJsx);
}

/**
 * Counts the number of animated elements in code to assess visual complexity
 */
export function countAnimatedElements(code: string): number {
  let count = 0;
  if (code.includes('spring(')) count += 3;
  if (code.includes('interpolate(')) count += 2;
  if (code.includes('sin(') || code.includes('cos(')) count += 2;
  if (code.includes('GradientBackground') || code.includes('radial-gradient')) count += 2;
  if (code.includes('backdropFilter') || code.includes('blur(')) count += 2;
  if (code.includes('boxShadow') || code.includes('box-shadow')) count += 1;
  if (code.includes('Array.from') || code.includes('.map(')) count += 2;
  if (code.includes('translateZ') || code.includes('perspective')) count += 2;
  if (code.includes('rotate(')) count += 1;
  if (code.includes('scale(')) count += 1;
  return count;
}

/**
 * Checks if generated code meets minimum visual quality threshold
 */
export function meetsQualityThreshold(code: string): { passes: boolean; score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 0;

  // Check for animated background
  if (code.includes('radial-gradient') || code.includes('GradientBackground') || code.includes('backgroundColor')) {
    score += 15;
  } else {
    issues.push('Missing animated background');
  }

  // Check for particles/ambient elements
  if (code.includes('Array.from') && (code.includes('sin(') || code.includes('cos('))) {
    score += 20;
  } else {
    issues.push('Missing floating particles');
  }

  // Check for camera movement
  if (code.includes('scale(') && code.includes('interpolate(')) {
    score += 15;
  } else {
    issues.push('Missing camera movement');
  }

  // Check for spring physics
  if (code.includes('spring(')) {
    score += 15;
  } else {
    issues.push('Missing spring physics');
  }

  // Check for glassmorphism
  if (code.includes('backdropFilter') || code.includes('blur(')) {
    score += 10;
  } else {
    issues.push('Missing glassmorphism effects');
  }

  // Check for depth layers
  if (code.includes('z-index') || code.includes('zIndex')) {
    score += 10;
  } else {
    issues.push('Missing depth layers');
  }

  // Check for multi-layer transforms
  const transformMatches = code.match(/transform:/g);
  if (transformMatches && transformMatches.length >= 3) {
    score += 15;
  } else {
    issues.push('Insufficient transform animations');
  }

  return { passes: score >= 60, score, issues };
}
