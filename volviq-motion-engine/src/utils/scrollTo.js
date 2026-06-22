/**
 * Native smooth scroll — avoids Lenis fighting the main thread on low-end GPUs.
 */
export function scrollToTarget(target, options = {}) {
  const { behavior = 'smooth', block = 'start' } = options;
  const el =
    typeof target === 'string'
      ? document.querySelector(target)
      : target;

  if (!el) return;

  el.scrollIntoView({ behavior, block });
}
