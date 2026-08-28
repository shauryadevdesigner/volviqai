// ============================================================================
// 3D Animation Player Wrapper
// ============================================================================
// Renders 3D Remotion components - the component MUST include its own <Canvas>
// ============================================================================

"use client";

import { Player } from "@remotion/player";

interface Player3DProps {
  component: React.ComponentType;
  durationInFrames: number;
  fps: number;
  width?: number;
  height?: number;
}

export function Player3D({
  component: Component,
  durationInFrames,
  fps,
  width = 3840,
  height = 2160,
}: Player3DProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Player
        key={Component.toString()}
        component={Component}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={width}
        compositionHeight={height}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
        controls
        autoPlay
        loop
        spaceKeyToPlayOrPause={false}
        clickToPlay={false}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
