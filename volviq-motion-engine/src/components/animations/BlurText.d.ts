import type { FC } from 'react';

export interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'chars' | string;
  direction?: 'top' | 'bottom' | string;
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

declare const BlurText: FC<BlurTextProps>;
export default BlurText;
