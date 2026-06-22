---
title: Chart & Data Visualization
impact: HIGH
impactDescription: improves data viz quality and animation polish
tags: charts, data, visualization, bar-chart, pie-chart, graphs
---

## Bar Chart Animations

Stagger bar entrances with 3-5 frame delays and use spring() for organic motion.

**Incorrect (all bars animate together):**

```tsx
const bars = data.map((item, i) => {
  const height = spring({ frame, fps, config: { damping: 18 } });
  return <div style={{ height: height * item.value }} />;
});
```

**Correct (staggered entrances with acceleration):**

```tsx
const STAGGER_DELAY = 5;

const bars = data.map((item, i) => {
  const delay = i * STAGGER_DELAY * (1 + i * 0.08);
  const height = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  return <div style={{ height: height * item.value }} />;
});
```

## Always Include Y-Axis Labels

Charts without axis labels are hard to read. Always add labeled tick marks.

**Incorrect (no axis):**

```tsx
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>{bars}</div>
```

**Correct (with Y-axis):**

```tsx
const yAxisSteps = [0, 25, 50, 75, 100];

<div style={{ display: "flex" }}>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    {yAxisSteps.reverse().map((step) => (
      <span style={{ fontSize: 12, color: "#888" }}>{step}</span>
    ))}
  </div>
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      borderLeft: "1px solid #333",
    }}
  >
    {bars}
  </div>
</div>;
```

## Gradient-Filled Bars (Premium)

Never use flat single-color bars. Use vertical gradients.

**Incorrect (flat color):**

```tsx
<div style={{ backgroundColor: "#4f8fff", height: barHeight }} />
```

**Correct (gradient with glow):**

```tsx
<div
  style={{
    background: `linear-gradient(180deg, #6ba3ff 0%, #4f8fff 50%, #3a6fd8 100%)`,
    height: barHeight,
    borderRadius: "6px 6px 0 0",
    boxShadow: `0 0 20px rgba(79, 143, 255, ${0.15 + progress * 0.15})`,
    position: "relative",
  }}
/>
```

## Animated Value Counter

Values count up as bars grow — never appear as static numbers.

```tsx
const countProgress = spring({
  frame: frame - delay,
  fps,
  config: { damping: 22, stiffness: 80 },
});
const displayValue = Math.round(item.value * countProgress);

{barHeight > 30 && (
  <span
    style={{
      color: "#ffffff",
      fontSize: 13,
      fontWeight: 600,
      opacity: countProgress,
      textShadow: "0 1px 4px rgba(0,0,0,0.3)",
    }}
  >
    {displayValue.toLocaleString()}
  </span>
)}
```

## Animated Grid Lines

Draw grid lines that fade in before bars animate.

```tsx
const GRID_COUNT = 5;
const gridEntrance = spring({
  frame: frame - 5,
  fps,
  config: { damping: 30, stiffness: 100 },
});

{Array.from({ length: GRID_COUNT }).map((_, i) => {
  const y = (i / (GRID_COUNT - 1)) * chartHeight;
  return (
    <div
      key={i}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: 1,
        background: "rgba(255, 255, 255, 0.06)",
        opacity: gridEntrance,
        transform: `scaleX(${gridEntrance})`,
        transformOrigin: "left center",
      }}
    />
  );
})}
```

## Chart Title + Subtitle Choreography

Title and subtitle enter with stagger before data animates.

```tsx
const titleEntrance = spring({
  frame,
  fps,
  config: { damping: 20, stiffness: 100 },
});
const subtitleEntrance = spring({
  frame: frame - 10,
  fps,
  config: { damping: 20, stiffness: 100 },
});

<div style={{ opacity: titleEntrance, transform: `translateY(${(1 - titleEntrance) * 15}px)` }}>
  <div style={{ fontSize: 28, fontWeight: 700, color: "#e8e6e3", letterSpacing: "-0.01em" }}>
    {TITLE}
  </div>
</div>
<div style={{ opacity: subtitleEntrance, transform: `translateY(${(1 - subtitleEntrance) * 10}px)` }}>
  <div style={{ fontSize: 14, color: "#888", marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
    {SUBTITLE}
  </div>
</div>
```

## Glow Effect on Active/Highlighted Bar

```tsx
const isHighlighted = i === highlightedIndex;
const glowIntensity = isHighlighted ? 0.3 + Math.sin(frame * 0.08) * 0.1 : 0;

<div
  style={{
    boxShadow: isHighlighted
      ? `0 0 30px rgba(79, 143, 255, ${glowIntensity}), 0 0 60px rgba(79, 143, 255, ${glowIntensity * 0.5})`
      : "none",
    transform: isHighlighted ? "scaleX(1.05)" : "scaleX(1)",
    transition: "transform 0.3s",
  }}
/>
```

## Pie Chart Animation

Animate segments using stroke-dashoffset, starting from 12 o'clock.

```tsx
const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);

<circle
  r={radius}
  cx={center}
  cy={center}
  fill="none"
  stroke={color}
  strokeWidth={strokeWidth}
  strokeDasharray={`${segmentLength} ${circumference}`}
  strokeDashoffset={offset}
  transform={`rotate(-90 ${center} ${center})`}
/>;
```
