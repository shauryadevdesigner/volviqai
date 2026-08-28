import { useEffect, useState } from 'react';

/**
 * Detects when we should reduce motion / GPU work to keep scroll smooth.
 */
export function usePerformanceProfile() {
  const [profile, setProfile] = useState(() => getInitialProfile());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setProfile(getInitialProfile());

    mq.addEventListener('change', onChange);

    const conn = navigator.connection;
    if (conn?.addEventListener) {
      conn.addEventListener('change', onChange);
    }

    return () => {
      mq.removeEventListener('change', onChange);
      if (conn?.removeEventListener) {
        conn.removeEventListener('change', onChange);
      }
    };
  }, []);

  return profile;
}

function getInitialProfile() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const saveData = navigator.connection?.saveData === true;
  const lowMemory = navigator.deviceMemory != null && navigator.deviceMemory <= 4;
  const mobile = coarsePointer || window.innerWidth < 768;

  const lite =
    reducedMotion || saveData || lowMemory || (mobile && window.innerWidth < 1024);

  return {
    reducedMotion,
    mobile,
    lite,
    /** Disable Lenis — use native scroll */
    nativeScroll: reducedMotion || saveData || lite,
    /** Skip WebGL backgrounds (Hyperspeed, dual MagicRings, Lanyard) */
    noWebGL: lite || reducedMotion,
    /** Fewer particles / sparks */
    lowEffects: lite || mobile,
  };
}
