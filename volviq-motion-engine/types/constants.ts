import { z } from "zod";
import { CompositionAudioPropsSchema } from "../src/types/audio";

export const COMP_NAME = "DynamicComp";

export const CompositionProps = z.object({
  code: z.string(),
  durationInFrames: z.number(),
  fps: z.number(),
  audio: CompositionAudioPropsSchema.optional(),
  planTier: z.enum(["free", "pro", "business"]).optional(),
});
