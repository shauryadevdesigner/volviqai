import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll without fighting layout or starving the main thread.
 */
export function useLenisScroll({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) {
      window.lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });

    window.lenis = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    let frameId = 0;
    let running = true;

    const raf = (time) => {
      if (!running) return;
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frameId);
      } else {
        running = true;
        frameId = requestAnimationFrame(raf);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', onVisibility);
      lenis.destroy();
      window.lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [enabled]);
}
