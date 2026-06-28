import type { PlanTier } from "@/types/profile";
import { PREMIUM_FPS, DEFAULT_FPS } from "./video-duration";

export const RENDER_WIDTH = 3840;
export const RENDER_HEIGHT = 2160;
export const RENDER_CRF = 18;
export const RENDER_PIXEL_FORMAT = "yuv420p" as const;
export const RENDER_IMAGE_FORMAT = "png" as const;
export const RENDER_CODEC = "h264" as const;
export const RENDER_AUDIO_CODEC = "aac" as const;
/** AAC bitrate for high-quality output */
export const RENDER_AUDIO_BITRATE = "320k";

export function getRenderFps(planTier?: PlanTier, explicitFps?: number): number {
  if (explicitFps && explicitFps > 0) {
    return explicitFps;
  }
  return planTier === "business" ? PREMIUM_FPS : DEFAULT_FPS;
}

export const lambdaRenderQuality = {
  codec: RENDER_CODEC,
  crf: RENDER_CRF,
  imageFormat: RENDER_IMAGE_FORMAT,
  pixelFormat: RENDER_PIXEL_FORMAT,
  audioCodec: RENDER_AUDIO_CODEC,
  audioBitrate: RENDER_AUDIO_BITRATE,
} as const;
