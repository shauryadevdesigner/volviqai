import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionAudioProps } from "@/types/audio";

const COMPOSITION_NAME = "DynamicComp";

type CompositionAudioLayerProps = {
  audio?: CompositionAudioProps;
};

/**
 * Synced audio layer for DynamicComp — trims/loops/fades to match video duration.
 */
export const CompositionAudio: React.FC<CompositionAudioLayerProps> = ({
  audio,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  if (!audio?.src) {
    return null;
  }

  const trimBefore = audio.trimBefore ?? 0;
  const trimAfter = audio.trimAfter ?? durationInFrames;
  const from = audio.from ?? 0;
  const shouldLoop = audio.loop ?? false;

  const fadeOutStart = Math.max(0, durationInFrames - 30);
  const volumeCallback = (f: number) => {
    if (typeof audio.volume === "number") {
      return audio.volume;
    }
    return interpolate(f, [fadeOutStart, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  return (
    <Audio
      src={audio.src}
      from={from}
      durationInFrames={audio.durationInFrames ?? durationInFrames}
      trimBefore={trimBefore}
      trimAfter={trimAfter}
      volume={volumeCallback}
      loop={shouldLoop}
      playbackRate={audio.playbackRate ?? 1}
      muted={audio.muted}
      toneFrequency={audio.toneFrequency}
      audioStreamIndex={audio.audioStreamIndex ?? 0}
      requestInit={audio.requestInit}
      onError={(error) => {
        console.log(
          `[${COMPOSITION_NAME}] Audio error at frame ${frame} (fps=${fps}, src=${audio.src}):`,
          error.message,
        );
        return "fallback";
      }}
    />
  );
};
