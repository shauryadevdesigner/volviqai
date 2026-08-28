// Volviq Motion Engine Core Integration Layer
import { RivePlayer } from "../../components/rive/RivePlayer";
import { MotionWrapper } from "../../components/rive/MotionWrapper";
import { getElasticSpring, getLinearMapping, EASINGS } from "../timeline/easing";

export const VolviqMotionEngine = {
  // Rive rendering primitives
  Player: RivePlayer,
  
  // Layout wrappers
  Wrapper: MotionWrapper,
  
  // Timing / Easing helpers
  timing: {
    spring: getElasticSpring,
    linear: getLinearMapping,
    curves: EASINGS,
  },
  
  // Config defaults
  presets: {
    logoReveal: {
      animationType: "scale-in" as const,
      duration: 35,
      intensity: 1.1,
    },
    headingSlide: {
      animationType: "fade-up" as const,
      duration: 30,
      intensity: 0.8,
    },
    ambientDrift: {
      animationType: "drift-parallax" as const,
      intensity: 0.5,
    },
  }
};

export default VolviqMotionEngine;
