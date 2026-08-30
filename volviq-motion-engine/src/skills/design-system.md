# Design System — Volviq Reference Style

## CRITICAL: Light Theme Only
- Backgrounds: ALWAYS use light gradients. NEVER use solid black or dark backgrounds.
- Use: `linear-gradient(180deg, #ffffff 0%, #f5f5fa 50%, #f0f0f5 100%)` or similar soft light gradients.
- Accent colors: Use soft pastels and neon accents on light backgrounds.

## Color Palette
- Background: `#f5f5fa` to `#ffffff` gradients
- Text primary: `#1a1a1a` (near-black)
- Text secondary: `#666666`
- Accent: `#C8FF3D` (neon lime) or brand color
- Surface (cards): `rgba(40, 40, 50, 0.82)` with backdrop blur for glassmorphism
- Surface border: `rgba(255, 255, 255, 0.12)`

## Typography
- Font family: `-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif`
- Headlines: `fontWeight: 800`, `fontSize: 64-80px`, `letterSpacing: '-0.03em'`
- Body: `fontWeight: 500`, `fontSize: 20-24px`, `letterSpacing: '-0.01em'`
- ALWAYS use tight negative letter-spacing for display text.

## Spacing
- Generous padding: 40-60px
- Centered compositions
- Max content width: 900px centered

## Glassmorphism (for cards/notifications)
```tsx
background: 'rgba(40, 40, 50, 0.82)',
backdropFilter: 'blur(40px) saturate(180%)',
WebkitBackdropFilter: 'blur(40px) saturate(180%)',
border: '1px solid rgba(255,255,255,0.12)',
boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
