import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { isRemotionContext } from "./RivePlayer";

export type AnimationType =
  | "scale-in"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "blur-in"
  | "drift-parallax"
  | "breathing-idle"
  | "none";

export interface MotionWrapperProps {
  children: React.ReactNode;
  animationType: AnimationType;
  duration?: number; // in frames
  delay?: number; // in frames
  intensity?: number; // scale/shift amount
  style?: React.CSSProperties;
  className?: string;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  animationType,
  duration = 30,
  delay = 0,
  intensity = 1.0,
  style,
  className,
}) => {
  const inRemotion = isRemotionContext();

  if (!inRemotion) {
    // Basic CSS transition wrapper in browser preview for responsiveness and simple hover styles
    return (
      <div className={className} style={{ transition: "all 0.3s ease", ...style }}>
        {children}
      </div>
    );
  }

  return (
    <RemotionMotionWrapper
      animationType={animationType}
      duration={duration}
      delay={delay}
      intensity={intensity}
      style={style}
      className={className}
    >
      {children}
    </RemotionMotionWrapper>
  );
};

const RemotionMotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  animationType,
  duration = 30,
  delay = 0,
  intensity = 1.0,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Adjust frame based on start delay
  const activeFrame = Math.max(0, frame - delay);

  // Easing/Spring configurations matching design-tokens
  const springValue = spring({
    frame: activeFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    },
  });

  const animatedStyle: React.CSSProperties = {};

  switch (animationType) {
    case "scale-in": {
      // Spring scale-in with slight overshoot
      const scale = interpolate(springValue, [0, 1], [0, 1 * intensity]);
      const opacity = interpolate(activeFrame, [0, Math.min(10, duration)], [0, 1]);
      animatedStyle.transform = `scale(${scale})`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "fade-up": {
      // Slides up from bottom
      const translateY = interpolate(springValue, [0, 1], [80 * intensity, 0]);
      const opacity = interpolate(activeFrame, [0, Math.min(15, duration)], [0, 1]);
      animatedStyle.transform = `translateY(${translateY}px)`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "fade-down": {
      const translateY = interpolate(springValue, [0, 1], [-80 * intensity, 0]);
      const opacity = interpolate(activeFrame, [0, Math.min(15, duration)], [0, 1]);
      animatedStyle.transform = `translateY(${translateY}px)`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "fade-left": {
      const translateX = interpolate(springValue, [0, 1], [80 * intensity, 0]);
      const opacity = interpolate(activeFrame, [0, Math.min(15, duration)], [0, 1]);
      animatedStyle.transform = `translateX(${translateX}px)`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "fade-right": {
      const translateX = interpolate(springValue, [0, 1], [-80 * intensity, 0]);
      const opacity = interpolate(activeFrame, [0, Math.min(15, duration)], [0, 1]);
      animatedStyle.transform = `translateX(${translateX}px)`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "blur-in": {
      const blur = interpolate(springValue, [0, 1], [20 * intensity, 0]);
      const opacity = interpolate(activeFrame, [0, Math.min(20, duration)], [0, 1]);
      animatedStyle.filter = `blur(${blur}px)`;
      animatedStyle.opacity = opacity;
      break;
    }

    case "drift-parallax": {
      // Continuous background drift
      const drift = interpolate(frame, [0, 300], [0, 60 * intensity]);
      animatedStyle.transform = `translateX(${drift}px)`;
      break;
    }

    case "breathing-idle": {
      // Continuous breathing loop (using sine wave)
      const breathing = Math.sin(frame * 0.04) * 0.015 * intensity;
      animatedStyle.transform = `scale(${1 + breathing})`;
      break;
    }

    default:
      break;
  }

  return (
    <div
      className={className}
      style={{
        ...animatedStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
