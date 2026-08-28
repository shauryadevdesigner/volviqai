import { useEffect, useRef, useState } from 'react';

export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px 0px', threshold: 0.08, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return { ref, inView };
}
