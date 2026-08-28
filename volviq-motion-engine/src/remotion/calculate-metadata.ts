import type { CalculateMetadataFunction } from "remotion";
import {
  clampDurationInFrames,
  resolveFps,
} from "@/lib/video-duration";
import {
  RENDER_CODEC,
  RENDER_HEIGHT,
  RENDER_IMAGE_FORMAT,
  RENDER_PIXEL_FORMAT,
  RENDER_WIDTH,
} from "@/lib/render-quality";
import type { CompositionAudioProps } from "@/types/audio";

export type DynamicCompInputProps = {
  code: string;
  durationInFrames: number;
  fps: number;
  audio?: CompositionAudioProps;
  planTier?: "free" | "pro" | "business";
};

export const calculateDynamicCompMetadata: CalculateMetadataFunction<
  DynamicCompInputProps
> = ({ props }) => {
  const durationInFrames = clampDurationInFrames(props.durationInFrames);
  const fps = resolveFps(props.fps, props.planTier);

  return {
    durationInFrames,
    fps,
    width: RENDER_WIDTH,
    height: RENDER_HEIGHT,
    defaultCodec: RENDER_CODEC,
    defaultVideoImageFormat: RENDER_IMAGE_FORMAT,
    defaultPixelFormat: RENDER_PIXEL_FORMAT,
  };
};
