---
title: Design System & Profiles
impact: HIGH
impactDescription: enforces design language profiles, typography tokens, motion tokens, and curated font pairings
tags: design, profiles, tokens, typography, font, palette, color
---

## Design Language Profiles

Choose the profile that matches the user's prompt style. Define constants for the colors, fonts, spacing, and radius tokens at the top of the component.

### 1. Luxury
* **Keywords**: watch, perfume, gold, jewelry, whiskey, real estate, premium, elegant, high-end, luxury, rolex
* **Colors**: Warm dark (#0d0a07), gold accent (#d4af37), soft beige/champagne (#f4ebd0), clean white (#ffffff)
* **Fonts**: `Playfair Display` or `Cormorant Garamond` (Display) + `Inter` or `Cormorant Garamond` (Body)
* **Design Token Constants**:
```tsx
const COLOR = {
  bg: "#0d0a07",
  accent: "#d4af37",
  text: "#ffffff",
  textMuted: "#a89e95",
  surface: "rgba(255, 255, 255, 0.03)"
};
const SPACE = { xs: 8, sm: 16, md: 32, lg: 64, xl: 120 };
const RADIUS = { sm: 4, md: 8, lg: 16, xl: 24 };
```

### 2. Technology
* **Keywords**: software, AI, dashboard, developer, crypto, blockchain, cybersecurity, futuristic, tech, robot
* **Colors**: Deep space blue/black (#030712), electric blue/cyan (#3b82f6), tech grid line (#1f2937), white (#ffffff)
* **Fonts**: `Space Grotesk` or `Geist` (Display) + `Inter` or `JetBrains Mono` (Body)
* **Design Token Constants**:
```tsx
const COLOR = {
  bg: "#030712",
  accent: "#3b82f6",
  accentAlt: "#06b6d4",
  text: "#f9fafb",
  textMuted: "#9ca3af",
  surface: "rgba(15, 23, 42, 0.6)"
};
const SPACE = { xs: 8, sm: 16, md: 32, lg: 64, xl: 120 };
const RADIUS = { sm: 2, md: 4, lg: 8, xl: 16 };
```

### 3. Fashion
* **Keywords**: clothing, apparel, sneakers, style, trend, model, runway, couture, street wear
* **Colors**: Pure black (#000000), bright white (#ffffff), editorial gray (#666666), occasional hot accent (#ff0055)
* **Fonts**: `Instrument Serif` or `EB Garamond` (Display) + `Inter` (Body)
* **Design Token Constants**:
```tsx
const COLOR = {
  bg: "#000000",
  accent: "#ffffff",
  accentAlt: "#ff0055",
  text: "#ffffff",
  textMuted: "#888888",
  surface: "rgba(255, 255, 255, 0.05)"
};
const SPACE = { xs: 10, sm: 20, md: 40, lg: 80, xl: 140 };
const RADIUS = { sm: 0, md: 0, lg: 0, xl: 0 }; // Sharp edges for editorial look
```

### 4. Startup / SaaS
* **Keywords**: app, productivity, team, colab, calendar, notes, marketing, sales, workflow, saas
* **Colors**: Modern violet (#5b21b6), vibrant indigo (#4f46e5), soft gray (#f3f4f6) or dark canvas (#0b0f19), warm orange/yellow accent (#f97316)
* **Fonts**: `Plus Jakarta Sans` or `Satoshi` (Display) + `Inter` (Body)
* **Design Token Constants**:
```tsx
const COLOR = {
  bg: "#0b0f19",
  accent: "#6366f1",
  accentAlt: "#f97316",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  surface: "rgba(30, 41, 59, 0.5)"
};
const SPACE = { xs: 8, sm: 16, md: 32, lg: 64, xl: 120 };
const RADIUS = { sm: 6, md: 12, lg: 24, xl: 32 }; // Very rounded friendly corners
```

### 5. Sports & Gaming
* **Keywords**: fitness, gym, running, gaming, stream, energy, esports, workout, speed, adrenaline
* **Colors**: Dark matte charcoal (#09090b), electric neon lime/green (#10b981), fire red (#ef4444), white (#ffffff)
* **Fonts**: `Outfit` or `Druk Wide` (Display, bold/condensed) + `Inter` (Body)
* **Design Token Constants**:
```tsx
const COLOR = {
  bg: "#09090b",
  accent: "#10b981",
  accentAlt: "#ef4444",
  text: "#ffffff",
  textMuted: "#71717a",
  surface: "rgba(24, 24, 27, 0.8)"
};
const SPACE = { xs: 8, sm: 16, md: 32, lg: 64, xl: 120 };
const RADIUS = { sm: 4, md: 8, lg: 12, xl: 20 };
```

## Google Fonts Loading Pattern

Always import fonts inside a `<style>` tag within the main container. Ensure both the Display and Body fonts are fetched in a single request if possible, or loaded properly:

```tsx
return (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
      `}
    </style>
    {/* Video elements */}
  </AbsoluteFill>
);
```

## Typography Tokens Implementation

Reference the predefined typography levels in inline styles:

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
    color: COLOR.textMuted,
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
