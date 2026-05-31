---
name: Monochrome Technical
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#303031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  code-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The design system embodies a high-end, futuristic "blueprint" aesthetic. It is tailored for advanced technical interfaces, high-performance computing, or luxury aerospace applications. The personality is precise, clinical, and uncompromisingly modern. 

The visual style draws heavily from **Minimalism** and **Modern Technical** movements, utilizing a strict monochromatic palette to eliminate distraction and emphasize data integrity. Elements are characterized by high contrast, sharp geometric precision, and an intentional lack of decorative fluff, evoking the feeling of a sophisticated head-up display (HUD).

## Colors
The palette is restricted to a high-contrast dark mode.
- **Primary (#ffffff):** Used for critical data, active states, and primary typography. It should pierce through the dark background.
- **Secondary/Accent (#888888):** A muted steel gray for secondary information, borders, and inactive states.
- **Neutral/Surface-Container (#1a1a1a):** Provides depth by defining component boundaries and grouped content areas against the true black background.
- **Surface (#000000):** The base background color, creating an "infinite depth" effect common in technical hardware interfaces.

## Typography
**Sora** is the sole typeface, chosen for its geometric clarity and technical rhythm. 
- Headlines use tighter tracking and heavier weights to command attention. 
- Body text remains airy for legibility. 
- Labels are frequently set in uppercase with increased letter-spacing to mimic engineering schematics and data-heavy readouts. 
- Numerical data should always be presented clearly, prioritizing the typeface's geometric numerals.

## Layout & Spacing
The layout follows a **Fixed Grid** system based on a 4px baseline unit. This "micro-grid" ensures every element aligns to a technical standard.
- **Desktop:** A 12-column grid with 16px gutters and 32px outer margins.
- **Mobile:** A 4-column grid with 16px gutters and 16px margins.
- Elements should span defined columns to maintain the "blueprint" structure. Padding inside components should be generous (usually 24px or 32px) to prevent the high-contrast white text from feeling cramped against dark surfaces.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layers** and **Bold Borders** rather than shadows. 
- **Level 0 (Background):** Pure black `#000000`.
- **Level 1 (Surface):** `#1a1a1a` for cards and containers.
- **Interaction:** Instead of shadows, use 1px solid borders in `#ffffff` for primary focus or `#888888` for subtle containment. 
- **Overlays:** Modals use a semi-transparent black backdrop with a distinct 1px white border to separate them from the background. 
Shadows are discouraged to maintain the sharp, flat technical aesthetic.

## Shapes
The shape language is strictly **Sharp (0px radius)**. Every button, input field, and card must have 90-degree corners. This reinforces the engineering/blueprint metaphor. Decorative elements like "corner snips" or "crosshair indicators" can be used to further the technical feel, but the core geometry must remain orthogonal and sharp.

## Components
- **Buttons:** 
  - *Primary:* Solid `#ffffff` background with `#000000` text. 
  - *Secondary:* 1px solid `#888888` border, no fill, `#ffffff` text.
- **Input Fields:** 1px solid `#1a1a1a` border. On focus, the border turns `#ffffff`. Text labels sit above the input in `label-sm` style.
- **Chips/Tags:** Small rectangular blocks with a `#1a1a1a` background and `label-sm` white text.
- **Cards:** No shadow. 1px solid `#1a1a1a` border, or a subtle tonal shift to `#1a1a1a` background.
- **Lists:** Separated by 1px solid lines in `#1a1a1a`. Hover states use a very subtle highlight to `#1a1a1a`.
- **Progress Bars:** Thin 2px lines. The track is `#1a1a1a`, the filler is `#ffffff`.
- **Technical Accents:** Use 1px "crosshair" icons in corners of containers to emphasize the blueprint aesthetic.