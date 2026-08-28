---
title: Scene Transitions
impact: HIGH
impactDescription: enables smooth scene changes and professional video flow
tags: transitions, fade, slide, wipe, scenes
---

## TransitionSeries for Scene Changes

Use TransitionSeries to animate between multiple scenes or clips.

**Incorrect (abrupt scene cuts):**

```tsx
<Sequence from={0} durationInFrames={60}>
  <SceneA />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <SceneB />
</Sequence>
```

**Correct (smooth transitions):**

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Available Transition Types

Import transitions from their respective modules:

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
```

## Slide Transition with Direction

Specify slide direction for enter/exit animations.

```tsx
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>;
```

Directions: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

## Custom Crossfade Without TransitionSeries

For simple opacity crossfades within a single component:

```tsx
const TRANSITION_START = 60;
const TRANSITION_DURATION = 15;

const scene1Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

const scene2Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<AbsoluteFill style={{ opacity: scene1Opacity }}><SceneA /></AbsoluteFill>
<AbsoluteFill style={{ opacity: scene2Opacity }}><SceneB /></AbsoluteFill>
```

## Timing Options

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Linear timing - constant speed
linearTiming({ durationInFrames: 20 });

// Spring timing - organic motion (preferred for premium feel)
springTiming({ config: { damping: 200 }, durationInFrames: 25 });
```

## Zoom-Through Transition

Scene A zooms in and fades, Scene B starts zoomed out and lands at 1.0.

```tsx
const ZOOM_START = 120;
const ZOOM_DURATION = 20;

const zoomProgress = interpolate(
  frame,
  [ZOOM_START, ZOOM_START + ZOOM_DURATION],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

// Scene A zooms in and fades out
const sceneAScale = interpolate(zoomProgress, [0, 1], [1, 1.3]);
const sceneAOpacity = interpolate(zoomProgress, [0, 0.6], [1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Scene B zooms in from behind
const sceneBScale = interpolate(zoomProgress, [0, 1], [0.8, 1]);
const sceneBOpacity = interpolate(zoomProgress, [0.3, 1], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<AbsoluteFill style={{ transform: `scale(${sceneAScale})`, opacity: sceneAOpacity }}>
  <SceneA />
</AbsoluteFill>
<AbsoluteFill style={{ transform: `scale(${sceneBScale})`, opacity: sceneBOpacity }}>
  <SceneB />
</AbsoluteFill>
```

## Blur Transition

Blur out → blur in for dreamy scene changes.

```tsx
const BLUR_START = 120;
const BLUR_DURATION = 25;

const blurProgress = interpolate(
  frame,
  [BLUR_START, BLUR_START + BLUR_DURATION],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

const sceneABlur = interpolate(blurProgress, [0, 0.5], [0, 12], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const sceneBBlur = interpolate(blurProgress, [0.5, 1], [12, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<AbsoluteFill style={{ filter: `blur(${sceneABlur}px)`, opacity: 1 - blurProgress }}>
  <SceneA />
</AbsoluteFill>
<AbsoluteFill style={{ filter: `blur(${sceneBBlur}px)`, opacity: blurProgress }}>
  <SceneB />
</AbsoluteFill>
```

## Staggered Element Exit Before Transition

Elements exit individually before the scene transitions — creates premium choreography.

```tsx
const SCENE_EXIT_START = 110;
const EXIT_STAGGER = 4;

// Each element exits in reverse order
const elements = ITEMS.map((item, i) => {
  const reverseI = ITEMS.length - 1 - i;
  const exitDelay = SCENE_EXIT_START + reverseI * EXIT_STAGGER;
  const exitProgress = spring({
    frame: frame - exitDelay,
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const exitY = interpolate(exitProgress, [0, 1], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ transform: `translateY(${exitY}px)`, opacity: exitOpacity }}>
      {item}
    </div>
  );
});
```

## Color Flash Transition

Brief white or accent color flash between scenes for energy.

```tsx
const FLASH_MID = 130;
const FLASH_DURATION = 8;

const flashOpacity = interpolate(
  frame,
  [FLASH_MID - FLASH_DURATION, FLASH_MID, FLASH_MID + FLASH_DURATION],
  [0, 0.8, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<AbsoluteFill
  style={{
    backgroundColor: "#ffffff",
    opacity: flashOpacity,
    pointerEvents: "none",
    zIndex: 100,
  }}
/>
```

## Design-System Motion Tokens

Use these standard motion primitives for consistent ad pacing:

### Motion Tokens Definition
```tsx
// SoftEntrance: subtle fade-in and slide-up
const softEntrance = (delay: number) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const y = interpolate(p, [0, 1], [30, 0]);
  return { opacity: p, transform: `translateY(${y}px)` };
};

// LuxuryReveal: scale down + fade in + blur clear
const luxuryReveal = (delay: number) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 80 },
  });
  const scale = interpolate(p, [0, 1], [1.05, 1.0]);
  const opacity = interpolate(p, [0, 1], [0, 1]);
  const blur = interpolate(p, [0, 1], [4, 0]);
  return {
    opacity,
    transform: `scale(${scale})`,
    filter: `blur(${blur}px)`,
  };
};

// ElasticPop: energetic bounce
const elasticPop = (delay: number) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const scale = interpolate(p, [0, 1], [0, 1]);
  return { transform: `scale(${scale})` };
};
```
