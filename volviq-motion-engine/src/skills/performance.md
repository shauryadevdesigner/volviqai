---
title: Performance & Optimization
impact: HIGH
impactDescription: optimizes rendering, prevents playback lag, and enforces GPU-accelerated styles
tags: performance, budget, optimization, fps, scale, memo, sequence
---

## GPU-Accelerated Animations

Always prefer animating `transform` and `opacity` properties. Animating layout properties (like `width`, `height`, `top`, `left`, `margin`) triggers browser layout recalculations on every frame, leading to severe lag.

### Anti-Pattern: Animating Layout Properties (Laggy)
```tsx
// Avoid this: triggers layout recalculations
const boxWidth = interpolate(frame, [0, 30], [100, 300]);
return <div style={{ width: boxWidth, height: 100, backgroundColor: "#ff3366" }} />;
```

### Best Practice: Animating Transform (GPU-Accelerated)
```tsx
// Use this: runs on the GPU
const boxScaleX = interpolate(frame, [0, 30], [1, 3]);
return (
  <div
    style={{
      width: 100,
      height: 100,
      transform: `scaleX(${boxScaleX})`,
      transformOrigin: "left center",
      backgroundColor: "#ff3366",
    }}
  />
);
```

## Scene Phasing with Sequence

Never render all elements of a video simultaneously. Use Remotion's `<Sequence>` component to mount and animate elements only when they are active. This prevents unnecessary React rendering cycles and interpolation calls for off-screen elements.

### Best Practice: Phased Scenes
```tsx
const HOOK_DURATION = 45;
const SHOWCASE_DURATION = 90;

return (
  <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
    {/* Scene 1: Hook (0-45f) */}
    <Sequence from={0} durationInFrames={HOOK_DURATION}>
      <HookScene />
    </Sequence>

    {/* Scene 2: Product Showcase (45-135f) */}
    <Sequence from={HOOK_DURATION} durationInFrames={SHOWCASE_DURATION}>
      <ShowcaseScene />
    </Sequence>
  </AbsoluteFill>
);
```

## Expensive Styles Restriction

Avoid animating expensive CSS properties like `filter` (especially `blur`) or `box-shadow` on more than 2 elements at the same time. If you need a glow or shadow effect, define it as static, or use a pre-rendered atmospheric shape rather than dynamic CSS calculations.

### Anti-Pattern: Too many simultaneous heavy filters
```tsx
// Avoid: multiple blurred divs animating at once
const blurValue1 = interpolate(frame, [0, 30], [20, 0]);
const blurValue2 = interpolate(frame, [15, 45], [20, 0]);

return (
  <>
    <div style={{ filter: `blur(${blurValue1}px)` }} />
    <div style={{ filter: `blur(${blurValue2}px)` }} />
    <div style={{ backdropFilter: "blur(20px)" }} />
  </>
);
```

### Best Practice: Static Glow / Limited Filters
```tsx
// Use 1-2 large static blurred ambient shapes for background glow instead
return (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(80px)", // High blur, but static (not animating)
        top: -100,
        left: -100,
      }}
    />
  </AbsoluteFill>
);
```

## Memoizing Expensive Data

Use React's `useMemo` hook to compute complex mathematical values, path arrays, or derived state that does not change on every single frame.

### Best Practice: Memoized Values
```tsx
// Pre-calculate decorative layout values once rather than every frame
const stars = useMemo(() => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    seed: Math.random(),
  }));
}, []);

return (
  <>
    {stars.map((star) => {
      // Light breathing animation using frame inside, but positions are static
      const opacity = 0.3 + Math.sin(frame * 0.05 + star.seed * 10) * 0.3;
      return (
        <div
          key={star.id}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            opacity,
          }}
        />
      );
    })}
  </>
);
```
