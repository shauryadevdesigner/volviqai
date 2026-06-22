---
title: Timing & Sequencing
impact: HIGH
impactDescription: controls when elements appear and enables complex choreography
tags: sequence, series, timing, delay, choreography
---

## Sequence for Delayed Elements

Use Sequence to delay when an element appears in the timeline.

**Incorrect (manual frame checks):**

```tsx
{
  frame >= 30 && <Title />;
}
{
  frame >= 60 && <Subtitle />;
}
```

**Correct (Sequence component):**

```tsx
import { Sequence } from "remotion";

<Sequence from={30} durationInFrames={90}>
  <Title />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <Subtitle />
</Sequence>
```

## Series for Sequential Playback

Use Series when elements should play one after another without overlap.

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>;
```

## Series with Offset for Overlap

Use negative offset for overlapping sequences (10-20% overlap for smooth flow):

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </Series.Sequence>
</Series>
```

## Staggered Element Entrances

For staggered animations of multiple items, calculate delays:

**Incorrect (hardcoded delays):**

```tsx
const items = data.map((item, i) => {
  const delay = i === 0 ? 0 : i === 1 ? 10 : i === 2 ? 20 : 30;
  // ...
});
```

**Correct (calculated stagger with acceleration):**

```tsx
const STAGGER_DELAY = 8;
const BASE_DELAY = 15;

const items = data.map((item, i) => {
  const delay = BASE_DELAY + i * STAGGER_DELAY * (1 + i * 0.08);
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  return (
    <Item
      key={i}
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
      }}
    />
  );
});
```

## Nested Sequences

Sequences can be nested for complex timing:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90}>
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60}>
    <Subtitle />
  </Sequence>
</Sequence>
```

## Frame References Inside Sequences

Inside a Sequence, useCurrentFrame() returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

## Cinematic Act Structure (Intro → Main → Outro)

Structure animations as 3-act narratives for professional pacing.

```tsx
// At 300 frames (10s at 30fps):
const ACT_1_INTRO = { start: 0, end: 75 }; // 0-2.5s: Scene setup, title entrance
const ACT_2_MAIN = { start: 60, end: 240 }; // 2-8s: Main content (overlap with intro)
const ACT_3_OUTRO = { start: 225, end: 300 }; // 7.5-10s: CTA, logo, sign-off (overlap with main)

// Intro elements enter with stagger
const introProgress = spring({
  frame,
  fps,
  config: { damping: 18, stiffness: 100 },
});

// Main content fades up as intro settles
const mainEntrance = interpolate(
  frame,
  [ACT_2_MAIN.start, ACT_2_MAIN.start + 20],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

// Outro: elements exit, CTA enters
const outroProgress = interpolate(
  frame,
  [ACT_3_OUTRO.start, ACT_3_OUTRO.start + 20],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

## Beat Timing (Music-Paced Content)

Align key events to beat intervals for rhythmic feel.

```tsx
const BPM = 120;
const FRAMES_PER_BEAT = (60 / BPM) * fps; // 15 frames per beat at 120bpm, 30fps

// Key moments align to beats
const BEAT_1 = 0;
const BEAT_2 = FRAMES_PER_BEAT;
const BEAT_3 = FRAMES_PER_BEAT * 2;
const BEAT_4 = FRAMES_PER_BEAT * 3;
const BEAT_5 = FRAMES_PER_BEAT * 4;

// Elements enter on beats
const element1 = spring({ frame: frame - BEAT_1, fps, config: { damping: 15 } });
const element2 = spring({ frame: frame - BEAT_2, fps, config: { damping: 15 } });
const element3 = spring({ frame: frame - BEAT_3, fps, config: { damping: 15 } });
```

## Accelerating Stagger (Each Element Faster)

Later elements enter quicker than earlier ones — builds energy.

```tsx
const ITEMS = ["Revenue", "Users", "Growth", "Profit"];
const BASE_STAGGER = 12;

const delays = ITEMS.map((_, i) => {
  // Each gap shrinks: 12, 10, 8, 6...
  let total = 0;
  for (let j = 0; j < i; j++) {
    total += Math.max(4, BASE_STAGGER - j * 2);
  }
  return total;
});

// delays = [0, 12, 22, 30] — accelerating entries
```

## Hold Time Guidance

Elements need enough screen time to be read/absorbed.

```tsx
// Minimum hold times (at 30fps):
const HEADLINE_HOLD = 60; // 2 seconds minimum
const BODY_TEXT_HOLD = 90; // 3 seconds for readable text
const DATA_POINT_HOLD = 45; // 1.5 seconds for a number
const CTA_HOLD = 75; // 2.5 seconds for call-to-action
const LOGO_HOLD = 45; // 1.5 seconds for brand recognition

// Calculate total timing:
// Entrance (15-30f) + Hold + Exit (15-20f) = total element duration
```

## Overlap Technique for Continuous Flow

Never let the screen feel empty between elements. Overlap entrances with exits.

```tsx
const ELEMENT_A_EXIT_START = 80;
const ELEMENT_B_ENTRANCE_START = 70; // Starts 10 frames before A exits

// Element A exits
const exitA = interpolate(
  frame,
  [ELEMENT_A_EXIT_START, ELEMENT_A_EXIT_START + 15],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

// Element B enters (overlapping)
const entranceB = spring({
  frame: frame - ELEMENT_B_ENTRANCE_START,
  fps,
  config: { damping: 18, stiffness: 100 },
});

// Both visible during frames 70-95 (overlap window)
```
