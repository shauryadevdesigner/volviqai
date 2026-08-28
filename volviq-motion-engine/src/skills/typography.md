---
title: Typography & Text Animation
impact: HIGH
impactDescription: fixes common text animation bugs and improves readability
tags: typography, text, typewriter, kinetic, animation
---

## Typewriter Effect - Use String Slicing

Always use string slicing for typewriter effects. Never use per-character opacity.

**Incorrect (per-character opacity - breaks cursor positioning):**

```tsx
{
  text
    .split("")
    .map((char, i) => (
      <span style={{ opacity: i < typedCount ? 1 : 0 }}>{char}</span>
    ));
}
<span>|</span>;
```

**Correct (string slicing - cursor follows text):**

```tsx
const typedText = FULL_TEXT.slice(0, typedChars);

<span>{typedText}</span>
<span style={{ opacity: caretOpacity }}>▌</span>
```

## Cursor Blink - Use Smooth Interpolation

Blinking cursors should fade smoothly, not flash on/off abruptly.

**Incorrect (abrupt blink):**

```tsx
const caretVisible = Math.floor(frame / 15) % 2 === 0;
<span style={{ opacity: caretVisible ? 1 : 0 }}>|</span>;
```

**Correct (smooth blink):**

```tsx
const CURSOR_BLINK_FRAMES = 16;
const caretOpacity = interpolate(
  frame % CURSOR_BLINK_FRAMES,
  [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
  [1, 0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

<span style={{ opacity: caretOpacity }}>▌</span>;
```

## Word Carousel - Stable Width Container

Prevent layout shifts by using the longest word to set container width.

**Incorrect (width jumps between words):**

```tsx
<div style={{ position: "relative" }}>
  <span>{WORDS[currentIndex]}</span>
</div>
```

**Correct (stable width from longest word):**

```tsx
const longestWord = WORDS.reduce(
  (a, b) => (a.length >= b.length ? a : b),
  WORDS[0],
);

<div style={{ position: "relative" }}>
  <div style={{ visibility: "hidden" }}>{longestWord}</div>
  <div style={{ position: "absolute", left: 0, top: 0 }}>
    {WORDS[currentIndex]}
  </div>
</div>;
```

## Text Highlight - Two Layer Crossfade

Use overlapping layers for smooth highlight transitions.

```tsx
const typedOpacity = interpolate(
  frame,
  [highlightStart - 8, highlightStart + 8],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
const finalOpacity = interpolate(
  frame,
  [highlightStart, highlightStart + 8],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

{
  /* Typing layer */
}
<div style={{ opacity: typedOpacity }}>{typedText}</div>;

{
  /* Final layer with highlight */
}
<div style={{ position: "absolute", inset: 0, opacity: finalOpacity }}>
  <span>{preText}</span>
  <span style={{ backgroundColor: COLOR_HIGHLIGHT }}>{HIGHLIGHT_WORD}</span>
  <span>{postText}</span>
</div>;
```

## Animated Text Gradient (Premium)

Create shimmering gradient text for headlines.

```tsx
const gradientShift = frame * 1.5;

<span
  style={{
    backgroundImage: `linear-gradient(90deg, #4f8fff ${gradientShift}%, #a855f7 ${gradientShift + 40}%, #ff6b35 ${gradientShift + 80}%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontSize: 72,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  }}
>
  {HEADLINE_TEXT}
</span>;
```

## Split Text Reveal (Word-by-Word Stagger)

Reveal text word by word with spring physics for premium feel.

```tsx
const WORDS = TITLE_TEXT.split(" ");
const WORD_STAGGER = 6;

<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
  {WORDS.map((word, i) => {
    const wordDelay = i * WORD_STAGGER;
    const wordProgress = spring({
      frame: frame - wordDelay - ENTRANCE_DELAY,
      fps,
      config: { damping: 18, stiffness: 120 },
    });
    const wordY = interpolate(wordProgress, [0, 1], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <span
        key={i}
        style={{
          opacity: wordProgress,
          transform: `translateY(${wordY}px)`,
          display: "inline-block",
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        {word}
      </span>
    );
  })}
</div>;
```

## Cinematic Title Card

Title + subtitle + decorative divider line.

```tsx
const titleEntrance = spring({
  frame: frame - 20,
  fps,
  config: { damping: 20, stiffness: 100 },
});
const lineScale = spring({
  frame: frame - 35,
  fps,
  config: { damping: 25, stiffness: 120 },
});
const subtitleEntrance = spring({
  frame: frame - 45,
  fps,
  config: { damping: 20, stiffness: 100 },
});

// Title
<div
  style={{
    fontSize: 72,
    fontWeight: 800,
    color: "#e8e6e3",
    letterSpacing: "-0.02em",
    opacity: titleEntrance,
    transform: `translateY(${(1 - titleEntrance) * 25}px)`,
    textShadow: "0 2px 30px rgba(0,0,0,0.5)",
  }}
>
  {TITLE}
</div>

// Divider line
<div
  style={{
    width: 80,
    height: 2,
    background: "linear-gradient(90deg, transparent, #4f8fff, transparent)",
    transform: `scaleX(${lineScale})`,
    margin: "20px 0",
  }}
/>

// Subtitle
<div
  style={{
    fontSize: 18,
    fontWeight: 300,
    color: "rgba(232, 230, 227, 0.6)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: subtitleEntrance,
    transform: `translateY(${(1 - subtitleEntrance) * 15}px)`,
  }}
>
  {SUBTITLE}
</div>;
```

## Text Shadow & Glow for Headlines

```tsx
// Subtle depth shadow
textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)"

// Accent glow
textShadow: "0 0 40px rgba(79, 143, 255, 0.4), 0 2px 20px rgba(0, 0, 0, 0.5)"

// Warm glow
textShadow: "0 0 30px rgba(255, 107, 53, 0.3)"
```

## Typography Tokens & Curated Font Pools

Never use arbitrary sizes or random font-family declarations. Use the following design-system approved tokens:

### Curated Font Pools by Profile
- **Luxury**: Display: `Playfair Display` or `Cormorant Garamond` (weight 700) | Body: `Inter` (weight 300/400)
- **Technology**: Display: `Space Grotesk` or `Geist` (weight 700) | Body: `JetBrains Mono` or `Inter` (weight 400)
- **Fashion**: Display: `Instrument Serif` (weight 700, italicized looks beautiful) | Body: `Inter` (weight 300)
- **Startup**: Display: `Plus Jakarta Sans` or `Satoshi` (weight 800) | Body: `Inter` (weight 400)

### Typography Tokens Definition
```tsx
const TYPO = {
  display: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 84,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  headline: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  subheadline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 32,
    fontWeight: 400,
    lineHeight: 1.4,
    color: "#a89e95",
  },
  body: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 300,
    lineHeight: 1.6,
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  }
};
```
```
