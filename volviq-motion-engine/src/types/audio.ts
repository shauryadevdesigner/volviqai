import { z } from "zod";

export const CompositionAudioPropsSchema = z.object({
  src: z.string(),
  from: z.number().optional(),
  durationInFrames: z.number().optional(),
  trimBefore: z.number().optional(),
  trimAfter: z.number().optional(),
  loop: z.boolean().optional(),
  volume: z.number().min(0).max(1).optional(),
  playbackRate: z.number().optional(),
  muted: z.boolean().optional(),
  toneFrequency: z.number().min(0.01).max(2).optional(),
  audioStreamIndex: z.number().optional(),
  requestInit: z.record(z.string(), z.unknown()).optional(),
});

export type CompositionAudioProps = z.infer<typeof CompositionAudioPropsSchema>;
