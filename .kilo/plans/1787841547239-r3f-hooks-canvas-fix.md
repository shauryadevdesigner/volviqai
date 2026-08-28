# Plan: Spectacular Ad Mode Overhaul

## Problem
Current Ad output is "decent but basic" — same patterns, same layouts, same colors. Prompt tweaks alone won't fix this because:
1. The AI regenerates the same proven patterns it's confident will compile
2. The prompt tells it WHAT to do but not HOW to do it spectacularly
3. No post-processing enhances the raw output

## Strategy: Three-Layer Improvement

### Layer 1: Force Pattern Diversity via Code Injection (HIGH IMPACT)
Instead of describing what to do, inject ready-to-use diverse code patterns that the AI must adapt.

**File: `src/ai/orchestrator/stages/stage8-engineer.ts`**

Add a `STYLE_VARIATIONS` constant that gets randomly selected per generation and injected into the prompt. Each variation is a complete, different visual approach:

```typescript
const STYLE_VARIATIONS = [
  {
    name: "Neon Cyberpunk",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a0030 50%, #000a1a 100%)",
    primary: "#ff00ff",
    secondary: "#00ffff",
    accent: "#ffff00",
    text: "#ffffff",
    effects: "neon-glow",
    typography: "monospace-wide",
  },
  {
    name: "Luxury Gold",
    bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1510 50%, #0d0d0d 100%)",
    primary: "#d4af37",
    secondary: "#f5e6c8",
    accent: "#8b6914",
    text: "#f5e6c8",
    effects: "warm-shimmer",
    typography: "serif-elegant",
  },
  {
    name: "Arctic Minimal",
    bg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    primary: "#0f172a",
    secondary: "#38bdf8",
    accent: "#0284c7",
    text: "#0f172a",
    effects: "cool-shadows",
    typography: "sans-clean",
  },
  // ... more variations
];
```

Then inject the selected variation into the generation prompt so each ad gets a unique visual identity.

### Layer 2: Post-Generation Code Enhancement (MEDIUM IMPACT)
After the AI generates code, automatically enhance it with cinematic effects.

**File: `src/ai/orchestrator/stages/stage8-engineer.ts`**

Add a `enhanceCode()` function that:
- Adds film grain overlay if not present
- Adds vignette if not present
- Ensures at least 8 animated elements exist
- Adds camera movement if missing
- Adds floating particles if missing
- Validates color palette diversity

### Layer 3: Stronger Prompt Architecture (MEDIUM IMPACT)
Restructure the Ad generation prompt to be more prescriptive:

**File: `src/lib/generation-mode.ts`**

The current expanded prompt is good but needs to be MORE prescriptive:
- Give EXACT code patterns to use (not just descriptions)
- Specify EXACT color values (not just "warm" or "cool")
- Require SPECIFIC effects (not just "use at least 3")
- Ban common patterns that make ads look generic (centered text on gradient)

## Implementation Steps

1. **Add STYLE_VARIATIONS array** to `stage8-engineer.ts`
2. **Add random style selection** in `runStage8Unified` 
3. **Inject selected style** into the generation prompt
4. **Add `enhanceCode()` function** for post-generation enhancement
5. **Update Ad directive** in `generation-mode.ts` with more prescriptive patterns
6. **Update §19/§20** in `generation.ts` with exact code patterns

## Validation
- Generate 3+ ads with same prompt → each should look visually different
- Check for: varied color palettes, varied layouts, cinematic effects present
- Verify no 3D elements in Ad mode
- Verify compilation succeeds

## Files to Modify
1. `src/ai/orchestrator/stages/stage8-engineer.ts` - Add style variations + enhancement
2. `src/lib/generation-mode.ts` - More prescriptive Ad directive
3. `src/ai/prompts/generation.ts` - Exact code patterns in §19/§20
