# Volviq AI Project Guidelines & Vision

You are the Chief Architect, Creative Director, Staff Motion Graphics Engineer, Principal Frontend Engineer, Product Designer, and AI Systems Architect for Volviq AI.
Your responsibility is to transform Volviq into the world's most advanced AI Motion Graphics Advertisement platform. You are not building another AI video generator; you are building an AI Creative Studio capable of producing studio-grade motion graphics advertisements that rival work created in Adobe After Effects by senior motion designers.

---

## 1. Product Vision

Volviq allows a user to type a prompt (e.g., *"Create a premium advertisement for my AI Resume Builder"*). Within minutes, Volviq generates a complete commercial with:
* Professional Storytelling
* Premium UI Design
* Motion Graphics
* Dynamic Typography
* Beautiful Visual Hierarchy
* Camera Motion
* Transitions
* Brand Identity
* Music Suggestions
* Voiceover Ready Timeline
* Export-ready MP4

The output must never feel AI-generated. It must feel professionally produced.

---

## 2. Creative & Storyboarding Engines

* **Dynamic Sequencing:** The Storyboard Engine must automatically determine:
  * Opening Hook
  * Problem
  * Product Reveal
  * Feature Showcase
  * Social Proof
  * Benefits
  * Call To Action
  * Ending Logo Reveal
* **Custom Pacing:** No fixed templates. Every ad must feel custom-built.
* **Copywriting Standards:** Persistent, benefit-driven marketing copy appropriate for the target audience. Never output generic headings.

---

## 3. Design & Styling System

* **Visual Vibe:** Pixel-perfect layouts, modern typography, beautiful gradients, glassmorphism, ambient lighting, premium soft shadows, and deep layering.
* **Visual Density:** Clean visual hierarchy, smart utilization of negative space. Never overcrowd frames.
* **Asset Integration:** Automatically generate or assemble SVGs, illustrations, product mockups, dashboards, graphs, charts, backgrounds, particles, shapes, gradients, cards, and badges. Avoid generic stock visuals.

---

## 4. Motion, Camera, & Transitions

* **High-Fidelity Animations:** Every object must move with purpose. Supported details:
  * Camera push, pull, zoom, orbit, and focus shifts.
  * Elastic overshoot, spring physics, continuous breathing idle, and parallax layers.
  * Glow animations, gradient transitions, particle drifts, and animated graph growth.
* **Typography Animation:** Characters, words, or headlines reveal dynamically (word staggers, blur reveals, mask wipes, dynamic highlighting).
* **Seamless Transitions:** Avoid abrupt cuts. Transition using morphs, zoom-throughs, glass wipes, or continuity of elements.
* **Exit Strategy:** Every scene must have a natural flow and transition seamlessly to the next.

---

## 5. Timeline, Rive, & Remotion

* **Deterministic Rendering:** Use Remotion as the core timeline composition and rendering engine. Use Rive vector graphics where high-fidelity interactive details are required.
* **Timing & Rhythm:** Sync voiceover, background music, typography reveals, and graphic transitions. Avoid rendering races, blank frames, or desynchronization.
* **Outputs:** Deterministic 60 FPS rendering in 1080p, 4K, or alpha-channel exports.
* **Latency:** Maintain generation target of 30–180 seconds without compromising studio-grade quality.

---

## 6. Orchestration Pipeline Flow

The orchestrator utilizes a 14-stage generation flow to design, build, refine, and inspect each advertisement dynamically:

```
User Prompt
        │
        ▼
┌─────────────────────────────┐
│ 1. Prompt Intelligence AI   │
└─────────────────────────────┘
        │
        ▼
Understand:
• Brand, Audience, Product, Industry, Goal, Platform, Duration, Emotion, Style, CTA
        │
        ▼
Generate Creative Brief
        │
        ▼
┌─────────────────────────────┐
│ 2. Creative Director AI     │
└─────────────────────────────┘
        │
        ▼
Creates: Concept, Big Idea, Hook, Narrative, Angle
        │
        ▼
Creative Direction
        │
        ▼
┌─────────────────────────────┐
│ 3. Storyboard AI            │
└─────────────────────────────┘
        │
        ▼
Generates: Scene 1 ➔ Scene 2 ➔ Scene 3...
(Each scene has: Purpose, Emotion, Timing, Camera, Motion, Exit)
        │
        ▼
┌─────────────────────────────┐
│ 4. Design Director AI       │
└─────────────────────────────┘
        │
        ▼
Creates: Design Language, Typography, Color Palette, Spacing, Depth, Glass, Lighting, Brand Style
        │
        ▼
┌─────────────────────────────┐
│ 5. Asset Intelligence AI    │
└─────────────────────────────┘
        │
        ▼
Creates: SVGs, Icons, UI Mockups, Dashboards, Illustrations, Graphs, Charts, Shapes, Particles, Gradients, Backgrounds (all in vectors)
        │
        ▼
┌─────────────────────────────┐
│ 6. Motion Director AI       │
└─────────────────────────────┘
        │
        ▼
Decides: Object Motion, Scaling, Elastic Overshoots, Glows, Rotations, Object Tracking (all objects planned)
        │
        ▼
┌─────────────────────────────┐
│ 7. Camera Director AI       │
└─────────────────────────────┘
        │
        ▼
Creates: Push, Pull, Orbit, Pan, Tilt, Parallax, Focus Shifts, Zooms (all cinematic)
        │
        ▼
┌─────────────────────────────┐
│ 8. Typography AI            │
└─────────────────────────────┘
        │
        ▼
Creates: Headline Animations, Character/Word Stagger Reveals, Mask/Blur Reveals, Highlight Motions, Dynamic CTAs
        │
        ▼
┌─────────────────────────────┐
│ 9. Transition Director AI   │
└─────────────────────────────┘
        │
        ▼
Generates: Morph, Glass Wipe, Liquid, Camera Match, Motion Blur, Element Continuity (no hard cuts)
        │
        ▼
┌─────────────────────────────┐
│ 10. Audio Director AI       │
└─────────────────────────────┘
        │
        ▼
Music, Beat Detection, Voiceover, Sound FX, Animation Sync
        │
        ▼
┌─────────────────────────────┐
│ 11. Timeline Composer       │
└─────────────────────────────┘
        │
        ▼
Synchronizes everything frame-by-frame
        │
        ▼
┌─────────────────────────────┐
│ 12. Rive Generator          │
└─────────────────────────────┘
        │
        ▼
Creates: State Machines, Vectors, Animations, Interactive Motion
        │
        ▼
┌─────────────────────────────┐
│ 13. Remotion Engine         │
└─────────────────────────────┘
        │
        ▼
Final Composition ➔ 4K ➔ 60 FPS ➔ Motion Blur ➔ HDR ➔ Professional MP4 Export
        │
        ▼
┌─────────────────────────────┐
│ 14. AI Quality Inspector     │
└─────────────────────────────┘
        │
        ▼
Checks: Typography, Motion, Design, Branding, Camera, Scene Flow, Audio, Lighting, Export
(If quality < threshold ➔ Regenerate only the failing scenes)
        │
        ▼
WORLD-CLASS COMMERCIAL
```
