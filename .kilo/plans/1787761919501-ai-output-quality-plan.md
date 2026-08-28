# AI Output Quality Improvement Plan

## Goal
Improve AI-generated Remotion video quality across four dimensions: code correctness, visual polish, layout reliability, and generation completeness.

## Architecture Overview
```
User Prompt → Stage 8 (Generate) → Stage 9 (Validate/Repair) → Stage 12 (Compile) → Render
                     ↓ fail                              ↓ fail
              Stage 13 (Repair)                  One AI retry with error context
```

---

## Phase 1: Prompt Engineering Quick Wins (Highest ROI)

### 1.1 Strengthen System Prompt Rules
**File:** `src/ai/prompts/generation.ts`

Add to CRITICAL RUNTIME RULES:
- ALL animation state (springs, interpolations) MUST be declared as `const` at the top of the component body, before the return statement
- EVERY `<Sequence>` wrapper MUST have explicit `from` and `durationInFrames` numeric props
- Declare a `sceneDuration` constant when splitting into multiple sequences

Add new §16 LAYOUT SAFETY section:
- Wrap all sibling text/UI elements in a single `flex-direction: column` container with explicit `gap`
- Set explicit `z-index` on every layered element (background=0, content=10, foreground=20, overlay=30)
- NEVER position elements with `position: 'absolute'` without a parent with `position: 'relative'`
- Minimum gap between distinct text elements: `SPACING.sm` (16px)

### 1.2 Inject Code Examples into Prompt
**File:** `src/ai/prompts/generation.ts`

Add a ## §17 REFERENCE PATTERNS section with minimal working examples:

```tsx
// PATTERN: Spring entrance (COPY THIS EXACTLY)
const enterSpring = spring({ frame: frame - delay, fps, config: SPRINGS.luxury });
const opacity = interpolate(enterSpring, [0, 1], [0, 1]);
const translateY = interpolate(enterSpring, [0, 1], [30, 0]);

// PATTERN: Camera slow-dolly (COPY THIS EXACTLY)
const camZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.04],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// PATTERN: Scene sequence layout (COPY THIS EXACTLY)
const f = (pct) => Math.round(durationInFrames * (pct / 100));
<Sequence from={f(0)} durationInFrames={f(25)-f(0)}>...</Sequence>
<Sequence from={f(25)} durationInFrames={f(50)-f(25)}>...</Sequence>
```

### 1.3 Stage 8 Engineer Prompt Hardening
**File:** `src/ai/orchestrator/stages/stage8-engineer.ts`

Add to system prompt:
```
CRITICAL: Declare ALL animation variables (springs, interpolations) as const at the 
top of the component function body BEFORE the return statement. NEVER reference 
an undefined variable. Output complete code — never truncate with "..." or "// rest".
```

---

## Phase 2: Validation & Auto-Repair Improvements

### 2.1 Pre-Compile Syntax Validation
**File:** `src/remotion/jsx-validator.ts`

Add new validation pass `checkUndefinedIdentifiers(code)`:
1. Parse with Sucrase/Babel to extract all referenced identifiers
2. Check each against declared variables (const/let/var/function params)
3. Flag undefined references with line numbers
4. Return structured error for AI repair prompt

### 2.2 Auto-Fix Undefined Springs
**File:** `src/helpers/sanitize-response.ts`

Add `repairUndefinedAnimations(code)`:
1. Detect patterns like `const opacity = interpolate(s1Spring, ...)` where `s1Spring` is undefined
2. Auto-generate the missing spring declaration:
   ```ts
   const s1Spring = spring({ frame: frame - 0, fps, config: SPRINGS.luxury });
   ```
3. Insert missing declarations at the top of the component body

### 2.3 Layout Overlap Detection
**File:** `src/remotion/jsx-validator.ts`

Add `detectLayoutIssues(code)`:
1. Parse JSX to find sibling elements without flex container
2. Flag elements with `position: 'absolute'` without relative parent
3. Check for overlapping bounding boxes (heuristic based on translateY/position)
4. Return repair suggestions

### 2.4 Multi-Attempt Repair Loop
**File:** `src/ai/orchestrator/index.ts`

Increase repair attempts from 1 to 3:
- Attempt 1: Auto-repair via `repairUndefinedAnimations` + `repairGeneratedCode`
- Attempt 2: AI repair with specific error message from compile failure
- Attempt 3: AI repair with full reference patterns injected into prompt

---

## Phase 3: Truncation Prevention

### 3.1 Streaming Generation with Partial Render
**File:** `src/ai/orchestrator/stage8-engineer.ts`

Switch from `generateObject` to `streamText` with:
- Partial code accumulation during stream
- Real-time truncation detection (unclosed braces/tags)
- If truncation detected mid-stream: send continuation prompt to complete the component

### 3.2 Scene-Based Chunking for Long Content
**File:** `src/ai/orchestrator/stage8-engineer.ts`

For prompts detected as "long-form" (>3 scenes or >150 words):
1. Generate each scene as a separate component
2. Compose scenes in a wrapper with `<Sequence>` tags
3. Reduces per-request token pressure, prevents truncation

### 3.3 Continuation Prompt Fallback
**File:** `src/ai/orchestrator/stage8-engineer.ts`

When truncation detected:
1. Take the partial code
2. Send continuation prompt: "Complete this truncated Remotion component. Continue from where it cuts off:"
3. Merge completed code, validate again

---

## Phase 4: Visual Quality Boosters

### 4.1 Mandatory Animation Checklist
**File:** `src/ai/prompts/generation.ts`

Add to quality mandates:
```
Every component MUST include at least ONE of each:
- [ ] Camera movement (dolly, push-in, or parallax)
- [ ] Spring-based entrance (not linear)
- [ ] Floating particle elements (3-8 small divs with sin/cos drift)
- [ ] Animated background (GradientBackground or equivalent)
- [ ] Depth layers (foreground + midground + background)
```

### 4.2 Post-Generation Visual Validation
**File:** `src/ai/orchestrator/stage10-audit.ts`

Add visual checks after QA audit:
- Detect if component uses only linear interpolation → trigger re-generate with stronger spring mandate
- Detect missing GradientBackground → inject it automatically
- Detect no particle elements → inject floating particles overlay

### 4.3 Style Transfer from High-Scoring Templates
**File:** `src/ai/template-cache.ts`

When a generation scores >90 on QA audit:
- Extract its animation patterns (spring configs, interpolation ranges, camera movements)
- Store as reusable "style snippets"
- Inject matching style snippets into future generation prompts as reference

---

## Phase 5: Reliability & Error Recovery

### 5.1 Comprehensive Fallback Chain
**File:** `src/ai/provider.ts`

Implement tiered fallback:
1. Primary: `gemini-3.6-flash` (current)
2. On 429/timeout: Switch to `gemini-3.5-flash-lite`
3. On compile failure: Retry with `antigravity-preview-05-2026`
4. On truncation: Retry with `gemini-3-flash` at higher token budget

### 5.2 Request Deduplication
**File:** `src/ai/provider.ts`

Add `generateContent` memoization:
- Hash prompt + model + params
- Return cached result for identical requests within 5 min window
- Prevents duplicate API calls on rapid retries

### 5.3 Graceful Degradation
**File:** `src/ai/orchestrator/index.ts`

When all AI attempts fail:
1. Fall back to a simple static component with the user's text
2. Show user a clear error with the specific failure reason
3. Offer one-click retry with simplified prompt

---

## Implementation Order

| Step | Change | Impact | Effort |
|------|--------|--------|--------|
| 1 | Phase 1.1: Strengthen prompt rules | High | Low |
| 2 | Phase 1.2: Inject code examples | High | Low |
| 3 | Phase 1.3: Stage 8 prompt hardening | High | Low |
| 4 | Phase 2.2: Auto-fix undefined springs | High | Medium |
| 5 | Phase 2.4: Multi-attempt repair loop | High | Medium |
| 6 | Phase 3.1: Streaming generation | Medium | High |
| 7 | Phase 2.1: Pre-compile syntax validation | Medium | Medium |
| 8 | Phase 4.1: Mandatory animation checklist | Medium | Low |
| 9 | Phase 5.1: Comprehensive fallback chain | Medium | Medium |
| 10 | Phase 3.2: Scene-based chunking | Medium | High |

## Validation Plan

After implementation:
1. Generate 10 test prompts across categories (ad, explainer, social, product)
2. Measure: compile success rate, visual quality score (manual), runtime error count
3. Compare against baseline (current state)
4. Target: >90% first-attempt compile success, zero runtime errors in output

## Files Modified

- `src/ai/prompts/generation.ts` — System prompt improvements
- `src/ai/orchestrator/stages/stage8-engineer.ts` — Generation hardening
- `src/ai/orchestrator/index.ts` — Repair loop, graceful degradation
- `src/ai/provider.ts` — Fallback chain, deduplication
- `src/remotion/jsx-validator.ts` — New validation passes
- `src/helpers/sanitize-response.ts` — Auto-repair functions
- `src/ai/orchestrator/stages/stage10-audit.ts` — Visual validation
- `src/ai/template-cache.ts` — Style transfer storage

## Out of Scope

- Changing the underlying AI model provider (staying on Gemini)
- Adding new UI components for the dashboard
- Modifying the Remotion player or rendering pipeline
- Database schema changes
