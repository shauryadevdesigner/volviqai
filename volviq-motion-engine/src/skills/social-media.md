---
title: Social Media Content
impact: MEDIUM
impactDescription: optimizes content for mobile viewing and engagement
tags: social, instagram, tiktok, reels, stories, mobile
---

## Safe Zone for UI Overlays

Keep key content in the center 80% to avoid platform UI elements.

**Incorrect (content at edges - gets covered by UI):**

```tsx
<AbsoluteFill style={{ padding: 10 }}>
  <div style={{ position: "absolute", top: 0 }}>Title</div>
  <div style={{ position: "absolute", bottom: 0 }}>CTA</div>
</AbsoluteFill>
```

**Correct (content in safe zone):**

```tsx
const SAFE_MARGIN_TOP = height * 0.12;
const SAFE_MARGIN_BOTTOM = height * 0.15;
const SAFE_MARGIN_SIDES = width * 0.05;

<AbsoluteFill
  style={{
    paddingTop: SAFE_MARGIN_TOP,
    paddingBottom: SAFE_MARGIN_BOTTOM,
    paddingLeft: SAFE_MARGIN_SIDES,
    paddingRight: SAFE_MARGIN_SIDES,
  }}
>
  {content}
</AbsoluteFill>;
```

## Mobile-First Text Sizing

Text must be readable on small screens. Minimum 48px for headlines.

**Incorrect (text too small for mobile):**

```tsx
const TITLE_SIZE = 24;
const BODY_SIZE = 14;
```

**Correct (mobile-readable sizes):**

```tsx
const TITLE_SIZE = Math.max(48, Math.round(width * 0.08));
const BODY_SIZE = Math.max(28, Math.round(width * 0.045));
```

## Hook in First Frames

Social content needs immediate visual interest. Add movement from frame 0.

**Incorrect (static start):**

```tsx
const entrance = spring({ frame: frame - 30, fps }); // Starts after 1 second
```

**Correct (immediate hook):**

```tsx
const entrance = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 200 },
});
const pulse = Math.sin(frame * 0.15) * 0.03 + 1; // Subtle constant motion

<div style={{ transform: `scale(${entrance * pulse})` }}>{content}</div>;
```

## High Contrast Colors

Use bold, saturated colors that pop on mobile screens.

```tsx
// Good for social
const COLOR_PRIMARY = "#FF3366";
const COLOR_ACCENT = "#00D4FF";
const COLOR_BG = "#0A0A0A";

// Avoid muted/pastel colors that look washed out
// const COLOR_PRIMARY = "#C4A4A4"; // Too muted
```

## Loop-Friendly Endings

Design animations that can seamlessly loop.

```tsx
const TOTAL_DURATION = durationInFrames;
const loopProgress = (frame % TOTAL_DURATION) / TOTAL_DURATION;

// Or fade to start state at the end
const fadeOut = interpolate(
  frame,
  [TOTAL_DURATION - 15, TOTAL_DURATION],
  [1, 0],
);
```

## Swipe-Up CTA Animation

Animated upward arrow/CTA that bounces to draw attention.

```tsx
const CTA_START = 200;
const ctaEntrance = spring({
  frame: frame - CTA_START,
  fps,
  config: { damping: 12, stiffness: 150 },
});
const ctaBounce = Math.sin((frame - CTA_START) * 0.12) * 5;

<div
  style={{
    position: "absolute",
    bottom: SAFE_MARGIN_BOTTOM + 20,
    left: "50%",
    transform: `translateX(-50%) translateY(${(1 - ctaEntrance) * 40 + (ctaEntrance > 0.9 ? ctaBounce : 0)}px)`,
    opacity: ctaEntrance,
    textAlign: "center",
  }}
>
  <div style={{ fontSize: 20, color: "#ffffff", marginBottom: 8 }}>↑</div>
  <div
    style={{
      fontSize: 16,
      color: "#ffffff",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    }}
  >
    SWIPE UP
  </div>
</div>;
```

## Story Progress Bar

Animated progress bar at top — standard stories UI element.

```tsx
const TOTAL_SEGMENTS = 3;
const SEGMENT_DURATION = durationInFrames / TOTAL_SEGMENTS;
const currentSegment = Math.floor(frame / SEGMENT_DURATION);

<div
  style={{
    position: "absolute",
    top: SAFE_MARGIN_TOP - 30,
    left: SAFE_MARGIN_SIDES,
    right: SAFE_MARGIN_SIDES,
    display: "flex",
    gap: 4,
  }}
>
  {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
    const segmentProgress =
      i < currentSegment
        ? 1
        : i === currentSegment
          ? (frame - i * SEGMENT_DURATION) / SEGMENT_DURATION
          : 0;

    return (
      <div
        key={i}
        style={{
          flex: 1,
          height: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${segmentProgress * 100}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 2,
          }}
        />
      </div>
    );
  })}
</div>;
```

## Premium Gradient Backgrounds for Stories

```tsx
// Vibrant sunset
background: "linear-gradient(160deg, #ff6b35 0%, #ff3366 40%, #8b1a7a 100%)"

// Electric blue
background: "linear-gradient(160deg, #00d4ff 0%, #4f8fff 40%, #1a1a8e 100%)"

// Dark premium
background: "radial-gradient(ellipse at 50% 30%, #2a1a3e 0%, #0d0a17 70%, #050308 100%)"

// Warm gold
background: "linear-gradient(160deg, #ffd700 0%, #ff8c00 40%, #8b4513 100%)"
```
