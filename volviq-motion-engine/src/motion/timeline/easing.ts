// Easing primitives and timing helpers for motion control
import { interpolate, spring } from "remotion";

export interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

// 1. Elastic overshoot spring generator
export function getElasticSpring(
  frame: number,
  fps: number,
  config: SpringConfig = {}
): number {
  const { damping = 13, stiffness = 175, mass = 0.8 } = config;
  return spring({
    frame,
    fps,
    config: { damping, stiffness, mass },
  });
}

// 2. Linear mapping
export function getLinearMapping(
  frame: number,
  startFrame: number,
  endFrame: number,
  startVal: number,
  endVal: number
): number {
  return interpolate(frame, [startFrame, endFrame], [startVal, endVal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// 3. Easing Curves
export const EASINGS = {
  easeInOutQuad: (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
};
