/**
 * motionConfig.js — Centralized premium motion system for Volviq AI
 * 
 * All easing curves, spring physics, pacing profiles, and stagger configs
 * in one place. Inspired by Apple, Linear, Stripe, Arc Browser motion design.
 */

/* ─── Premium Easing Curves ─── */
export const ease = {
  // Explosive deceleration — feels fast then settles. The "expensive" ease.
  outExpo:      [0.16, 1, 0.3, 1],
  // Smooth cubic — elegant for long animations
  inOutCubic:   [0.65, 0, 0.35, 1],
  // Sharp start, butter finish — great for entrances
  outQuart:     [0.25, 1, 0.5, 1],
  // Subtle overshoot — items "pop" into place
  outBack:      [0.34, 1.56, 0.64, 1],
  // Strong overshoot — playful, attention-grabbing
  outBackStrong:[0.22, 1.8, 0.36, 1],
  // Cinematic slow-in slow-out — for hero/CTA reveals
  inOutQuint:   [0.83, 0, 0.17, 1],
  // Snap — near-instant then ease
  outSnap:      [0.1, 1, 0.2, 1],
  // Camera zoom feel
  cameraZoom:   [0.22, 0.61, 0.36, 1],
};

/* ─── Spring Physics Configs ─── */
export const spring = {
  // Default snappy spring
  snappy:     { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
  // Gentle settle with slight overshoot
  gentle:     { type: 'spring', stiffness: 200, damping: 24, mass: 1 },
  // Bouncy — playful overshoot
  bouncy:     { type: 'spring', stiffness: 300, damping: 15, mass: 0.6 },
  // Heavy — weighty, cinematic feel
  heavy:      { type: 'spring', stiffness: 120, damping: 20, mass: 1.5 },
  // Wobbly — organic, living feel
  wobbly:     { type: 'spring', stiffness: 180, damping: 12, mass: 0.8 },
  // Stiff — minimal overshoot, precise
  stiff:      { type: 'spring', stiffness: 500, damping: 35, mass: 0.5 },
  // Navbar entrance
  navbar:     { type: 'spring', stiffness: 260, damping: 22, mass: 0.9 },
};

/* ─── Variable Pacing Durations ─── */
export const pace = {
  flash:      0.2,    // Micro-interactions
  fast:       0.35,   // Quick reveals
  normal:     0.6,    // Standard transitions
  cinematic:  1.0,    // Hero-level reveals
  slow:       1.4,    // Deliberate, premium feel
  glacial:    2.0,    // CTA/ending sections — luxurious
};

/* ─── Stagger Profiles ─── */
export const stagger = {
  // Fast cascade — cards, list items
  fast:       { staggerChildren: 0.06, delayChildren: 0.1 },
  // Normal cascade
  normal:     { staggerChildren: 0.1, delayChildren: 0.15 },
  // Cinematic cascade — hero elements
  cinematic:  { staggerChildren: 0.18, delayChildren: 0.3 },
  // Slow cascade — CTA/ending
  slow:       { staggerChildren: 0.25, delayChildren: 0.4 },
  // Rapid fire — many small items
  rapid:      { staggerChildren: 0.04, delayChildren: 0.05 },
};

/* ─── Reusable Animation Variants ─── */
export const variants = {
  // Camera push-in: element starts zoomed in, settles to normal
  cameraPushIn: {
    hidden: { opacity: 0, scale: 1.3, filter: 'blur(12px)' },
    visible: { 
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: pace.cinematic, ease: ease.outExpo }
    },
  },

  // Camera pull-back: element starts normal, zooms out on scroll
  cameraPullBack: {
    hidden: { opacity: 0, scale: 1.15 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: pace.slow, ease: ease.inOutCubic }
    },
  },

  // Slide up with depth — 3D perspective entrance
  slideUpDepth: {
    hidden: { opacity: 0, y: 80, rotateX: 8, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, rotateX: 0, scale: 1,
      transition: { duration: pace.normal, ease: ease.outExpo }
    },
  },

  // Slide from left with 3D rotation
  slideLeftDepth: {
    hidden: { opacity: 0, x: -120, scale: 0.9, rotateY: 8 },
    visible: { 
      opacity: 1, x: 0, scale: 1, rotateY: 0,
      transition: { duration: pace.cinematic, ease: ease.outExpo }
    },
  },

  // Slide from right
  slideRightDepth: {
    hidden: { opacity: 0, x: 80, scale: 0.95 },
    visible: { 
      opacity: 1, x: 0, scale: 1,
      transition: { duration: pace.cinematic, ease: ease.outExpo, delay: 0.2 }
    },
  },

  // Clip-path curtain reveal from bottom
  curtainReveal: {
    hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
    visible: { 
      clipPath: 'inset(0% 0 0 0)', opacity: 1,
      transition: { duration: pace.cinematic, ease: ease.inOutCubic }
    },
  },

  // Clip-path wipe from left
  wipeLeft: {
    hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    visible: { 
      clipPath: 'inset(0 0% 0 0)', opacity: 1,
      transition: { duration: pace.slow, ease: ease.inOutCubic }
    },
  },

  // Scale up with spring overshoot
  springScale: {
    hidden: { opacity: 0, scale: 0.7 },
    visible: { 
      opacity: 1, scale: 1,
      transition: spring.bouncy,
    },
  },

  // Zoom-through: starts zoomed in, zooms to normal (fly into scene)
  zoomThrough: {
    hidden: { opacity: 0, scale: 1.4, filter: 'blur(6px)' },
    visible: { 
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: pace.slow, ease: ease.cameraZoom }
    },
  },

  // Fade up — basic but with premium easing
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: pace.normal, ease: ease.outExpo }
    },
  },

  // Stagger container
  staggerContainer: (profile = 'normal') => ({
    hidden: {},
    visible: { transition: stagger[profile] },
  }),

  // Character reveal (for text)
  charReveal: {
    hidden: { opacity: 0, y: 20, rotateX: 40 },
    visible: { 
      opacity: 1, y: 0, rotateX: 0,
      transition: { duration: pace.fast, ease: ease.outExpo }
    },
  },

  // Glacial fade — CTA/ending
  glacialFade: {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: pace.glacial, ease: ease.inOutCubic }
    },
  },
};

/* ─── GSAP Easing Strings (for ScrollTrigger) ─── */
export const gsapEase = {
  outExpo:      'expo.out',
  inOutCubic:   'cubic.inOut',
  outQuart:     'quart.out',
  outBack:      'back.out(1.7)',
  inOutQuint:   'quint.inOut',
  outElastic:   'elastic.out(1, 0.3)',
  sineInOut:    'sine.inOut',
  powerOut:     'power3.out',
  powerIn:      'power2.in',
};
