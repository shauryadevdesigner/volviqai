---
title: Lighting & Composition
impact: HIGH
impactDescription: creates cinematic depth, atmosphere, and premium visual feel through lighting and layered composition
tags: lighting, composition, gradient, glow, vignette, depth, atmosphere, parallax
---

## Gradient Background Recipes

Never use flat solid backgrounds. Always use multi-stop gradients.

**Incorrect (flat background):**

```tsx
<AbsoluteFill style={{ backgroundColor: "#000000" }}>
```

**Correct (rich gradient):**

```tsx
// Dark cinematic
<AbsoluteFill
  style={{
    background:
      "radial-gradient(ellipse at 30% 40%, #1a1a2e 0%, #0d1117 60%, #050508 100%)",
  }}
>

// Dark warm
<AbsoluteFill
  style={{
    background:
      "radial-gradient(ellipse at 50% 30%, #2a1a0e 0%, #0f0a06 60%, #050302 100%)",
  }}
>

// Dark cool blue
<AbsoluteFill
  style={{
    background:
      "linear-gradient(160deg, #0a1628 0%, #0d1117 40%, #06090f 100%)",
  }}
>

// Light premium
<AbsoluteFill
  style={{
    background:
      "radial-gradient(ellipse at 60% 30%, #ffffff 0%, #f8f6f0 50%, #ece8e0 100%)",
  }}
>
```

## Glow / Bloom Effect

Add glow behind focal elements to create depth and draw the eye.

```tsx
// Glow layer behind a product or text
<div
  style={{
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79, 143, 255, 0.25) 0%, transparent 70%)",
    filter: "blur(40px)",
    top: "30%",
    left: "40%",
    transform: "translate(-50%, -50%)",
  }}
/>

// Element glow via boxShadow
<div
  style={{
    boxShadow: "0 0 60px 20px rgba(79, 143, 255, 0.2), 0 0 120px 40px rgba(79, 143, 255, 0.08)",
  }}
>
```

## Animated Glow Pulsing

```tsx
const glowIntensity = 0.15 + Math.sin(frame * 0.06) * 0.08;
const glowSize = 60 + Math.sin(frame * 0.04) * 20;

<div
  style={{
    boxShadow: `0 0 ${glowSize}px 20px rgba(79, 143, 255, ${glowIntensity})`,
  }}
/>
```

## Vignette Overlay

Darken edges to focus attention on the center.

```tsx
// Add as the LAST layer (on top of everything)
<AbsoluteFill
  style={{
    background:
      "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.5) 100%)",
    pointerEvents: "none",
  }}
/>
```

## Depth-of-Field Simulation

Blur background elements to create focal depth.

```tsx
// Background layer (blurred, slow-moving)
<AbsoluteFill
  style={{
    filter: "blur(6px)",
    opacity: 0.4,
    transform: `translateX(${Math.sin(frame * 0.01) * 10}px)`,
  }}
>
  {/* Background decorative shapes */}
</AbsoluteFill>

// Midground layer (sharp, main content)
<AbsoluteFill>{/* Main content */}</AbsoluteFill>

// Foreground atmosphere (very blurred, subtle)
<AbsoluteFill
  style={{
    filter: "blur(12px)",
    opacity: 0.06,
    pointerEvents: "none",
  }}
>
  <div
    style={{
      width: 400,
      height: 400,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.5)",
      position: "absolute",
      top: "20%",
      right: "-10%",
    }}
  />
</AbsoluteFill>
```

## Parallax Motion

Layers move at different speeds to create spatial depth.

```tsx
const bgDrift = Math.sin(frame * 0.008) * 15;
const midDrift = Math.sin(frame * 0.012) * 8;
const fgDrift = Math.sin(frame * 0.02) * 3;

// Background: slowest
<div style={{ transform: `translate(${bgDrift}px, ${bgDrift * 0.5}px)` }}>

// Midground: medium
<div style={{ transform: `translate(${midDrift}px, 0)` }}>

// Foreground: fastest (or stationary focal point)
<div style={{ transform: `translate(${fgDrift}px, 0)` }}>
```

## Decorative Accent Elements

Add floating geometric shapes for visual richness.

```tsx
const accentFloat1 = Math.sin(frame * 0.03) * 8;
const accentFloat2 = Math.cos(frame * 0.025) * 6;
const accentRotate = frame * 0.3;

// Thin decorative line
<div
  style={{
    position: "absolute",
    width: 120,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
    top: "25%",
    left: "10%",
    transform: `translateY(${accentFloat1}px) rotate(${accentRotate * 0.1}deg)`,
  }}
/>

// Small dot accent
<div
  style={{
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "rgba(79, 143, 255, 0.3)",
    top: "60%",
    right: "15%",
    transform: `translateY(${accentFloat2}px)`,
    boxShadow: "0 0 12px rgba(79, 143, 255, 0.2)",
  }}
/>
```

## Professional Shadow for Floating Elements

```tsx
// Layered shadow for depth (not just one box-shadow)
<div
  style={{
    boxShadow:
      "0 4px 6px rgba(0, 0, 0, 0.1), 0 12px 24px rgba(0, 0, 0, 0.15), 0 24px 48px rgba(0, 0, 0, 0.1)",
    borderRadius: 16,
  }}
>
```

## Ken Burns Effect (Slow Zoom)

Subtle zoom creates cinematic life in static compositions.

```tsx
const zoomProgress = interpolate(frame, [0, durationInFrames], [1.06, 1.0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<AbsoluteFill style={{ transform: `scale(${zoomProgress})` }}>
  {/* All content */}
</AbsoluteFill>
```

## Design Language Profile Lighting Recipes

Pair background gradients and atmospheric glow configurations to match the active Design Profile:

### 1. Luxury (Deep Warm Gold/Bloom)
- **Background**: `radial-gradient(ellipse at 50% 30%, #17120a 0%, #0d0a07 60%, #030201 100%)`
- **Atmospheric Glow**: Large, slow pulsing warm gold bloom `rgba(212, 175, 55, 0.08)` behind the product.
- **Self-Critique Rule**: No neon borders. Avoid harsh shadows; use soft volumetric light.

### 2. Technology (Electric Blue/Cyber Grid)
- **Background**: `radial-gradient(circle at 70% 30%, #0d1527 0%, #030712 80%)`
- **Atmospheric Glow**: Sharp electric cyan glow `rgba(59, 130, 246, 0.15)` near visual hubs.
- **Self-Critique Rule**: Grid elements should be static or sub-pixel moving. No random neon lines.

### 3. Fashion (Editorial High-Contrast)
- **Background**: Pure flat black `#000000` or stark white `#ffffff`.
- **Atmospheric Glow**: Extreme directional spotlighting (monochromatic or single strong accent).
- **Self-Critique Rule**: Avoid decorative floating elements. Keep composition asymmetrical.

### 4. Startup (Friendly Soft Gradients)
- **Background**: Soft linear gradient `linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)`
- **Atmospheric Glow**: Colorful warm/cool overlapping blooms `rgba(99, 102, 241, 0.12)`.
- **Self-Critique Rule**: Use rounded, pill-like container overlays with backdrop-filter.
```
```
