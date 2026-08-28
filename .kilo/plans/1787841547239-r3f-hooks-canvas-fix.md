# Plan: Client Design Styles + Default Video Structure

## Requirements (from client)
- **8 scenes/frames** total in the video
- **Each scene 2.5 seconds** (20 seconds total)
- **Fast transitions** between scenes
- **Slide-up animations** for reveals
- **One design style randomly chosen** for the ENTIRE video (not per-scene)
- Design styles: **Maximalism, Minimalism, Glassmorphism, Brutalism** + more

## Current State
- We have 8 `STYLE_VARIATIONS` but they're color-based (Neon Cyberpunk, Luxury Gold, etc.)
- We need to add `designStyle` and `description` fields to control the COMPOSITION style, not just colors
- We need to enforce the 8-scene × 2.5s structure as default for Ad mode

## Implementation

### File 1: `src/ai/orchestrator/stages/stage8-engineer.ts`

Update `STYLE_VARIATIONS` to include `designStyle` and `description`:

```typescript
interface StyleVariation {
  name: string;
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  glow: string;
  designStyle: string;    // NEW: "maximalism" | "minimalism" | "glassmorphism" | "brutalism"
  description: string;    // NEW: How the AI should compose in this style
}
```

8 variations mapped to design styles:
1. Neon Cyberpunk → **maximalism** (dense, packed, glowing elements)
2. Luxury Gold → **minimalism** (clean, sparse, single focal point)
3. Arctic Glass → **glassmorphism** (frosted glass, blur, transparency)
4. Raw Brutalist → **brutalism** (thick borders, no radius, harsh contrast)
5. Sunset Maximal → **maximalism** (fiery, overlapping, rich textures)
6. Deep Minimal → **minimalism** (ultra-clean, vast dark space)
7. Emerald Glass → **glassmorphism** (nature glass, organic shapes)
8. Monochrome Brutal → **brutalism** (black/white, monospace, raw)

Update `getStyleDirective()` to include `designStyle` and `description` in the prompt.

### File 2: `src/lib/generation-mode.ts`

Update Ad directive to enforce:
- **8 scenes** total
- **Each scene 2.5 seconds** (use `Math.round(durationInFrames * 0.125)` per scene)
- **Fast transitions** (quick cuts, no slow fades)
- **Slide-up animations** as the primary reveal mechanism
- Reference the randomly chosen design style

### File 3: `src/ai/prompts/generation.ts`

Add design-style-specific code patterns:
- Maximalism: dense grid, overlapping elements, multiple animations
- Minimalism: single element, whitespace, subtle motion
- Glassmorphism: backdrop-filter blur, rgba borders, transparency
- Brutalism: thick solid borders, no border-radius, monospace, harsh contrast

## Validation
- Generate an Ad → should have 8 scenes × 2.5s each
- Each generation should randomly pick ONE design style for the whole video
- Slide-up animations should be the primary reveal mechanism
- Fast transitions between scenes
- Verify compilation succeeds

## Files to Modify
1. `src/ai/orchestrator/stages/stage8-engineer.ts` - Update STYLE_VARIATIONS with designStyle + description
2. `src/lib/generation-mode.ts` - Enforce 8-scene × 2.5s structure in Ad directive
3. `src/ai/prompts/generation.ts` - Add design-style code patterns
