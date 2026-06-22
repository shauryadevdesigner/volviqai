---
title: Spring Physics Animation
impact: HIGH
impactDescription: creates natural, organic motion instead of mechanical animations
tags: spring, physics, bounce, easing, organic
---

## Prefer spring() Over interpolate()

Use spring() for natural motion, interpolate() only for linear progress.

**Incorrect (mechanical motion):**

```tsx
const scale = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});
```

**Correct (organic spring motion):**

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 100 },
  durationInFrames: 30,
});
```

## Spring Config Parameters

```tsx
spring({
  frame,
  fps,
  config: {
    damping: 10, // Higher = less bounce (10-200)
    stiffness: 100, // Higher = faster snap (50-200)
    mass: 1, // Higher = more inertia (0.5-3)
  },
});
```

## Common Spring Presets

```tsx
// Snappy, minimal bounce (UI elements)
const snappy = { damping: 20, stiffness: 200 };

// Bouncy entrance (playful animations)
const bouncy = { damping: 8, stiffness: 100 };

// Smooth, no bounce (subtle reveals)
const smooth = { damping: 200, stiffness: 100 };

// Heavy, slow (large objects)
const heavy = { damping: 15, stiffness: 80, mass: 2 };

// Premium elegant (luxury ad entrances)
const elegant = { damping: 22, stiffness: 90, mass: 1.2 };
```

## Delayed Spring Start

Offset the frame for delayed spring animations:

**Incorrect (spring starts immediately):**

```tsx
const entrance = spring({ frame, fps, config: { damping: 12 } });
```

**Correct (spring starts after delay):**

```tsx
const ENTRANCE_DELAY = 20;
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  config: { damping: 12, stiffness: 100 },
});
// Returns 0 until frame 20, then animates to 1
```

## Spring for Scale with Overshoot

For bouncy scale animations that overshoot:

```tsx
const bounce = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 150 },
});
// Will overshoot past 1.0 before settling

<div style={{ transform: `scale(${bounce})` }}>{content}</div>;
```

## Combining Spring with Interpolate

Map spring output (0-1) to custom ranges:

```tsx
const springProgress = spring({ frame, fps, config: { damping: 15 } });

// Map to rotation
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

// Map to position
const translateY = interpolate(springProgress, [0, 1], [50, 0]);

<div style={{ transform: `translateY(${translateY}px) rotate(${rotation}deg)` }}>
```

## Chained Springs for Sequential Motion

```tsx
const PHASE_1_END = 30;
const PHASE_2_START = 25; // Slight overlap

const phase1 = spring({ frame, fps, config: { damping: 15 } });
const phase2 = spring({
  frame: frame - PHASE_2_START,
  fps,
  config: { damping: 12 },
});

// phase1 controls entrance, phase2 controls secondary motion
```

## Multi-Phase Spring Chain (Entrance → Settle → Micro-Float)

Create premium entrances that settle into idle ambient motion.

```tsx
// Phase 1: Entrance (spring in)
const entrance = spring({
  frame,
  fps,
  config: { damping: 15, stiffness: 100 },
});
const entranceY = interpolate(entrance, [0, 1], [40, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Phase 2: Micro-float (idle breathing after settling)
const SETTLE_FRAME = 40;
const isSettled = frame > SETTLE_FRAME;
const microFloat = isSettled ? Math.sin((frame - SETTLE_FRAME) * 0.05) * 3 : 0;

<div
  style={{
    opacity: entrance,
    transform: `translateY(${entranceY + microFloat}px)`,
  }}
>
```

## Elastic Reveal for Cards and Panels

Cards pop in with elastic overshoot then settle.

```tsx
const cardReveal = spring({
  frame: frame - cardDelay,
  fps,
  config: { damping: 10, stiffness: 140 },
});

const cardScale = interpolate(cardReveal, [0, 1], [0.9, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const cardY = interpolate(cardReveal, [0, 1], [25, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div
  style={{
    opacity: cardReveal,
    transform: `translateY(${cardY}px) scale(${cardScale})`,
  }}
>
```

## Anticipation Principle (Pull-Back Before Motion)

Add a tiny pull-back before the main motion for cinematic feel.

```tsx
const ANTIC_FRAMES = 8;
const ANTIC_AMOUNT = -5; // Pull back by 5px

const anticipation = frame < ANTIC_FRAMES
  ? interpolate(frame, [0, ANTIC_FRAMES], [0, ANTIC_AMOUNT], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  : 0;

const mainMotion = spring({
  frame: frame - ANTIC_FRAMES,
  fps,
  config: { damping: 12, stiffness: 150 },
});
const mainY = interpolate(mainMotion, [0, 1], [ANTIC_AMOUNT + 40, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

const finalY = frame < ANTIC_FRAMES ? anticipation : mainY;
```

## Physics-Based Exit Animation

Don't just fade out — accelerate away with spring physics.

```tsx
const EXIT_START = 240;
const exitProgress = spring({
  frame: frame - EXIT_START,
  fps,
  config: { damping: 20, stiffness: 200 },
});

const exitY = interpolate(exitProgress, [0, 1], [0, -50], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div style={{ transform: `translateY(${exitY}px)`, opacity: exitOpacity }}>
```
