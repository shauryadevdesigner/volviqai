import React from "react";
import { Composition } from "remotion";
import { MIN_DURATION_FRAMES, DEFAULT_FPS } from "@/lib/video-duration";
import {
  RENDER_HEIGHT,
  RENDER_WIDTH,
} from "@/lib/render-quality";
import { calculateDynamicCompMetadata } from "./calculate-metadata";
import { DynamicComp } from "./DynamicComp";

const defaultCode = `import { AbsoluteFill } from "remotion";
export const MyAnimation = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;`;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicComp"
        component={DynamicComp}
        durationInFrames={MIN_DURATION_FRAMES}
        fps={DEFAULT_FPS}
        width={RENDER_WIDTH}
        height={RENDER_HEIGHT}
        defaultProps={{
          code: defaultCode,
          durationInFrames: MIN_DURATION_FRAMES,
          fps: DEFAULT_FPS,
        }}
        calculateMetadata={calculateDynamicCompMetadata as never}
      />
    </>
  );
};
