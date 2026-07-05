import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Helper to safely detect if we are rendering inside a Remotion composition
export function isRemotionContext(): boolean {
  try {
    // If this hook doesn't throw, we are in a Remotion context
    useVideoConfig();
    return true;
  } catch {
    return false;
  }
}

export interface RivePlayerProps {
  src: string;
  artboard?: string;
  animation?: string;
  stateMachine?: string;
  inputs?: Record<string, number | boolean>;
  fit?: "contain" | "cover" | "fill" | "fitWidth" | "fitHeight" | "none" | "scaleDown";
  alignment?: "center" | "topLeft" | "topCenter" | "topRight" | "centerLeft" | "centerRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
  className?: string;
  style?: React.CSSProperties;
}

export const RivePlayer: React.FC<RivePlayerProps> = ({
  src,
  artboard,
  animation,
  stateMachine,
  inputs,
  fit = "contain",
  alignment = "center",
  className,
  style,
}) => {
  const inRemotion = isRemotionContext();

  if (inRemotion) {
    // Dynamic import pattern or standard require to avoid loading browser-only code in node/compiler
    try {
      const { RemotionRiveCanvas } = require("@remotion/rive");
      // RemotionRiveCanvasAlignment and RemotionRiveCanvasFit are mapped inside the package
      return (
        <RemotionRiveCanvas
          src={src}
          artboard={artboard}
          animation={animation}
          fit={fit as any}
          alignment={alignment as any}
          className={className}
          style={{ width: "100%", height: "100%", ...style }}
        />
      );
    } catch (e) {
      console.warn("Failed to load Remotion Rive Canvas, falling back to basic preview", e);
    }
  }

  // Browser/Dashboard preview using official @rive-app/react-canvas
  return (
    <BrowserRivePlayer
      src={src}
      artboard={artboard}
      animation={animation}
      stateMachine={stateMachine}
      inputs={inputs}
      fit={fit}
      alignment={alignment}
      className={className}
      style={style}
    />
  );
};

// Internal component for browser-only rendering to avoid server/node side imports breaking
const BrowserRivePlayer: React.FC<RivePlayerProps> = ({
  src,
  artboard,
  animation,
  stateMachine,
  inputs,
  fit,
  alignment,
  className,
  style,
}) => {
  const { useRive, useStateMachineInput } = require("@rive-app/react-canvas");

  const riveOptions: any = {
    src,
    artboard,
    autoplay: true,
  };

  if (stateMachine) {
    riveOptions.stateMachines = stateMachine;
  } else if (animation) {
    riveOptions.animations = animation;
  }

  const { rive, RiveComponent } = useRive(riveOptions);

  // Drive state machine inputs if provided
  React.useEffect(() => {
    if (!rive || !stateMachine || !inputs) return;

    Object.entries(inputs).forEach(([inputName, val]) => {
      try {
        const input = useStateMachineInput(rive, stateMachine, inputName);
        if (input) {
          input.value = val;
        }
      } catch (err) {
        console.warn(`Failed to set Rive input: ${inputName}`, err);
      }
    });
  }, [rive, stateMachine, inputs]);

  // Handle fit/alignment updates dynamically on the Rive instance
  React.useEffect(() => {
    if (rive) {
      // Map string values to Rive layout alignment/fit options if runtime supports it
      // Standard @rive-app/react-canvas handles fit and alignment through useRive parameters
    }
  }, [rive, fit, alignment]);

  return (
    <div className={className} style={{ width: "100%", height: "100%", overflow: "hidden", ...style }}>
      <RiveComponent />
    </div>
  );
};
