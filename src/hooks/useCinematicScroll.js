/**
 * useCinematicScroll.js — GSAP ScrollTrigger powered cinematic scroll effects
 * 
 * Provides: camera push-in, parallax depth, scroll-driven scale/opacity,
 * pinned sequences, and scroll velocity tracking for motion blur.
 */
import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera push-in / pull-back on scroll.
 * Element scales and fades as user scrolls past.
 * 
 * @param {Object} options
 * @param {number} options.startScale - Starting scale (e.g., 1.0)
 * @param {number} options.endScale - End scale (e.g., 0.85)
 * @param {number} options.startOpacity - Starting opacity (e.g., 1)
 * @param {number} options.endOpacity - End opacity (e.g., 0)
 * @param {string} options.start - ScrollTrigger start position
 * @param {string} options.end - ScrollTrigger end position
 * @param {boolean} options.disabled - Skip animation
 */
export function useScrollScale({
  startScale = 1,
  endScale = 0.85,
  startOpacity = 1,
  endOpacity = 0,
  start = 'top top',
  end = 'bottom top',
  disabled = false,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        scale: endScale,
        opacity: endOpacity,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: 0.8,
        },
      });
    });

    return () => ctx.revert();
  }, [disabled, startScale, endScale, startOpacity, endOpacity, start, end]);

  return ref;
}

/**
 * Parallax depth layer — element scrolls at a different speed.
 * 
 * @param {Object} options
 * @param {number} options.speed - Parallax speed multiplier (-1 to 1, 0 = static)
 * @param {boolean} options.disabled
 */
export function useParallax({ speed = 0.3, disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => speed * 200,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    });

    return () => ctx.revert();
  }, [disabled, speed]);

  return ref;
}

/**
 * Scroll-driven reveal with GSAP — more cinematic than Framer whileInView.
 * Supports staggered children.
 * 
 * @param {Object} options
 * @param {Object} options.from - GSAP from values
 * @param {Object} options.to - GSAP to values
 * @param {string} options.ease - GSAP ease string
 * @param {number} options.duration - Animation duration
 * @param {number} options.stagger - Stagger between children
 * @param {string} options.childSelector - CSS selector for children to stagger
 * @param {boolean} options.disabled
 */
export function useScrollReveal({
  from = { opacity: 0, y: 60 },
  to = { opacity: 1, y: 0 },
  ease = 'expo.out',
  duration = 1,
  stagger = 0,
  childSelector = null,
  start = 'top 85%',
  disabled = false,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const ctx = gsap.context(() => {
      const targets = childSelector
        ? ref.current.querySelectorAll(childSelector)
        : ref.current;

      gsap.fromTo(targets, from, {
        ...to,
        ease,
        duration,
        stagger: stagger || undefined,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [disabled]);

  return ref;
}

/**
 * Scroll-drawn line — line grows along its length as user scrolls.
 * Perfect for timeline connectors.
 * 
 * @param {Object} options
 * @param {string} options.direction - 'horizontal' or 'vertical'
 * @param {boolean} options.disabled
 */
export function useScrollLine({ direction = 'horizontal', disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const prop = direction === 'horizontal' ? 'scaleX' : 'scaleY';
    const origin = direction === 'horizontal' ? 'left center' : 'center top';

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, 
        { [prop]: 0, transformOrigin: origin },
        {
          [prop]: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 0.5,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [disabled, direction]);

  return ref;
}

/**
 * Scroll velocity tracker — provides current scroll speed
 * for motion blur and dynamic effects.
 */
export function useScrollVelocity() {
  const velocity = useRef(0);

  useEffect(() => {
    const onScroll = ScrollTrigger.observe({
      onChangeY: (self) => {
        velocity.current = Math.abs(self.velocityY);
      },
    });

    return () => onScroll.kill();
  }, []);

  return velocity;
}

/**
 * Pin section during scroll animation.
 * Section stays fixed while scroll-driven animation plays.
 */
export function useScrollPin({
  scrub = 1,
  end = '+=100%',
  disabled = false,
} = {}) {
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end,
        pin: true,
        scrub,
      });
    });

    return () => ctx.revert();
  }, [disabled, scrub, end]);

  return ref;
}

/**
 * Stagger-reveal children on scroll with premium easing.
 */
export function useStaggerReveal({
  stagger = 0.12,
  from = { opacity: 0, y: 50, scale: 0.95 },
  to = { opacity: 1, y: 0, scale: 1 },
  ease = 'expo.out',
  duration = 0.8,
  childSelector = ':scope > *',
  start = 'top 82%',
  disabled = false,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const children = ref.current.querySelectorAll(childSelector);
    if (!children.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(children, from, {
        ...to,
        ease,
        duration,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [disabled]);

  return ref;
}
