---
title: Cinematic Ad Production
impact: HIGH
impactDescription: transforms advertisements into studio-grade commercials with premium product reveals, CTAs, and brand storytelling
tags: ad, commercial, product, brand, marketing, luxury, premium, showcase
---

## Hero Product Reveal

Reveal the main product/subject with a cinematic entrance: scale from 0.85 with blur clearing.

```tsx
const REVEAL_START = 30;
const revealProgress = spring({
  frame: frame - REVEAL_START,
  fps,
  config: { damping: 18, stiffness: 80 },
});

const productScale = interpolate(revealProgress, [0, 1], [0.85, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const productBlur = interpolate(revealProgress, [0, 1], [8, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const productOpacity = interpolate(revealProgress, [0, 1], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div
  style={{
    transform: `scale(${productScale})`,
    filter: `blur(${productBlur}px)`,
    opacity: productOpacity,
  }}
>
  {/* Product content */}
</div>;
```

## Price / CTA Callout Animation

Prices and CTAs should pop in with a bounce after the product is revealed.

```tsx
const CTA_DELAY = 90;
const ctaBounce = spring({
  frame: frame - CTA_DELAY,
  fps,
  config: { damping: 10, stiffness: 180 },
});

const ctaGlow = 0.3 + Math.sin(frame * 0.08) * 0.15;

<div
  style={{
    transform: `scale(${ctaBounce})`,
    background: "linear-gradient(135deg, #ff6b35 0%, #ff3366 100%)",
    padding: "16px 40px",
    borderRadius: 12,
    boxShadow: `0 0 40px rgba(255, 107, 53, ${ctaGlow})`,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "0.02em",
  }}
>
  Shop Now — $29.99
</div>;
```

## Brand Logo Placement & Animation

Logo enters last with a refined fade + subtle float.

```tsx
const LOGO_DELAY = 120;
const logoEntrance = spring({
  frame: frame - LOGO_DELAY,
  fps,
  config: { damping: 25, stiffness: 100 },
});
const logoFloat = Math.sin(frame * 0.04) * 2;

<div
  style={{
    position: "absolute",
    bottom: 60,
    right: 60,
    opacity: logoEntrance,
    transform: `translateY(${(1 - logoEntrance) * 15 + logoFloat}px)`,
  }}
>
  {/* Logo */}
</div>;
```

## Multi-Scene Ad Structure

Structure ads as: Hook (0-60f) → Product (60-180f) → Features (180-240f) → CTA (240-300f).

```tsx
const HOOK_END = 60;
const PRODUCT_START = 50; // 10f overlap
const PRODUCT_END = 180;
const FEATURES_START = 170; // 10f overlap
const FEATURES_END = 240;
const CTA_START = 230; // 10f overlap

// Each scene fades in/out with overlap
const hookOpacity = interpolate(frame, [0, 10, HOOK_END - 15, HOOK_END], [0, 1, 1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const productOpacity = interpolate(
  frame,
  [PRODUCT_START, PRODUCT_START + 15, PRODUCT_END - 15, PRODUCT_END],
  [0, 1, 1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

## Testimonial Card Animation

Testimonial cards slide in from the side with frosted glass styling.

```tsx
const cardEntrance = spring({
  frame: frame - CARD_DELAY,
  fps,
  config: { damping: 15, stiffness: 100 },
});

<div
  style={{
    transform: `translateX(${(1 - cardEntrance) * 80}px)`,
    opacity: cardEntrance,
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: "32px 40px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  }}
>
  <div style={{ fontSize: 22, color: "#e8e6e3", lineHeight: 1.5, fontWeight: 300 }}>
    "This product changed everything."
  </div>
  <div style={{ fontSize: 14, color: "#888", marginTop: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
    — Jane Smith, CEO
  </div>
</div>;
```

## Urgency / Countdown Pattern

Animated countdown with pulsing glow for urgency.

```tsx
const COUNTDOWN_START = 200;
const timeLeft = Math.max(0, Math.ceil((durationInFrames - frame) / fps));
const urgencyPulse = 1 + Math.sin(frame * 0.15) * 0.05;
const urgencyGlow = 0.4 + Math.sin(frame * 0.12) * 0.2;

<div
  style={{
    transform: `scale(${urgencyPulse})`,
    color: "#ff3366",
    fontSize: 48,
    fontWeight: 800,
    textShadow: `0 0 30px rgba(255, 51, 102, ${urgencyGlow})`,
    letterSpacing: "-0.02em",
  }}
>
  {`${timeLeft}s LEFT`}
</div>;
```

## Shot Library Compositions

Reference these premium composition/camera primitives in ad setups.

### Hero Push (Ken Burns Zoom)
```tsx
const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div style={{ transform: `scale(${zoom})`, width: "100%", height: "100%" }}>
  {/* Inner content floats inside zoomed camera */}
</div>
```

### Product Rotation & Float
```tsx
const floatY = Math.sin(frame * 0.05) * 8;
const rotationY = (frame * 0.015) % (Math.PI * 2);

<ThreeCanvas>
  <mesh style={{ transform: `translateY(${floatY}px) rotateY(${rotationY}rad)` }}>
    {/* Product geometry */}
  </mesh>
</ThreeCanvas>
```

## Rhythm-Based 6-Beat Narrative

Always calculate beat frame milestones relative to `durationInFrames`:

```tsx
const BEAT = (percent: number) => Math.round(durationInFrames * percent);

const b1 = BEAT(0.15); // Hook Ends
const b2 = BEAT(0.30); // Curiosity Ends
const b3 = BEAT(0.50); // Showcase Ends
const b4 = BEAT(0.70); // Value Ends
const b5 = BEAT(0.85); // Emotional Peak Ends
// Beat 6: CTA to end

// Example: Scene phasing using Sequence
<Sequence from={0} durationInFrames={b1}>
  <HookScene />
</Sequence>
<Sequence from={b1} durationInFrames={b3 - b1}>
  <ShowcaseScene />
</Sequence>
```
