"use client";

import { Player, type ErrorFallback, type PlayerRef } from "@remotion/player";
import React, { useEffect, useRef } from "react";
import { ErrorDisplay, type ErrorType } from "../ErrorDisplay";
import { RenderControls } from "./RenderControls";
import { SettingsModal } from "./SettingsModal";
import type { ErrorCorrectionContext } from "@/types/conversation";

const errorTitles: Record<ErrorType, string> = {
  validation: "Invalid Prompt",
  api: "API Error",
  compilation: "Compilation Error",
};

const renderErrorFallback: ErrorFallback = ({ error }) => {
  return (
    <ErrorDisplay
      error={error.message || "An error occurred while rendering"}
      title="Runtime Error"
      variant="fullscreen"
      size="lg"
    />
  );
};

interface AnimationPlayerProps {
  Component: React.ComponentType | null;
  durationInFrames: number;
  fps: number;
  onDurationChange: (duration: number) => void;
  onFpsChange: (fps: number) => void;
  isCompiling: boolean;
  isStreaming: boolean;
  error: string | null;
  errorType?: ErrorType;
  code: string;
  onRuntimeError?: (error: string) => void;
  onFrameChange?: (frame: number) => void;
  errorCorrection?: ErrorCorrectionContext;
}

export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  Component,
  durationInFrames,
  fps,
  onDurationChange,
  onFpsChange,
  isCompiling,
  isStreaming,
  error,
  errorType = "compilation",
  code,
  onRuntimeError,
  onFrameChange,
  errorCorrection,
}) => {
  const playerRef = useRef<PlayerRef>(null);

  // Listen for runtime errors from the Player's error boundary
  // Component is included in deps because the Player remounts when Component changes (via key={Component.toString()})
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !onRuntimeError) return;

    const handleError = (e: { detail: { error: Error } }) => {
      onRuntimeError(e.detail.error.message);
    };

    player.addEventListener("error", handleError);
    return () => {
      player.removeEventListener("error", handleError);
    };
  }, [onRuntimeError, Component]);

  // Listen for frame changes and report to parent
  // Component is included in deps because the Player remounts when Component changes (via key={Component.toString()})
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !onFrameChange) return;

    const handleFrameUpdate = (e: { detail: { frame: number } }) => {
      onFrameChange(e.detail.frame);
    };

    player.addEventListener("frameupdate", handleFrameUpdate);
    return () => {
      player.removeEventListener("frameupdate", handleFrameUpdate);
    };
  }, [onFrameChange, Component]);

  const renderContent = () => {
    // During silent auto-correction, show the error with a correction badge
    // instead of hijacking the preview with a full-screen spinner
    if (isStreaming && errorCorrection) {
      return (
        <div className="w-[72%] mx-auto aspect-video max-h-[calc(100%-80px)] flex flex-col justify-center items-center gap-4 bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {error ? (
            <ErrorDisplay
              error={error}
              title={errorTitles[errorType]}
              variant="fullscreen"
              size="lg"
            />
          ) : (
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="w-3 h-3 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            <p className="text-primary text-xs font-medium">
              Auto-correcting (attempt {errorCorrection.attemptNumber}/{errorCorrection.maxAttempts})
            </p>
          </div>
        </div>
      );
    }

    // Full-screen spinner only for user-initiated generations
    if (isStreaming) {
      return (
        <div className="w-[72%] mx-auto aspect-video max-h-[calc(100%-80px)] flex flex-col justify-center items-center gap-4 bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">
            Waiting for code generation to finish...
          </p>
        </div>
      );
    }

    if (isCompiling) {
      return (
        <div className="w-[72%] mx-auto aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          title={errorTitles[errorType]}
          variant="fullscreen"
          size="lg"
        />
      );
    }

    if (!Component) {
      return (
        <div className="w-[72%] mx-auto aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] text-muted-foreground-dim text-lg font-sans">
          Select an example to get started
        </div>
      );
    }

    return (
      <>
        <div className="w-[72%] mx-auto aspect-video max-h-[calc(100%-80px)] rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <Player
            ref={playerRef}
            key={Component.toString()}
            component={Component}
            durationInFrames={durationInFrames}
            fps={fps}
            compositionHeight={2160}
            compositionWidth={3840}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            controls
            autoPlay
            loop
            errorFallback={renderErrorFallback}
            spaceKeyToPlayOrPause={false}
            clickToPlay={false}
            acknowledgeRemotionLicense
          />
        </div>
        <div className="flex items-center justify-between gap-6 mt-4">
          <RenderControls
            code={code}
            durationInFrames={durationInFrames}
            fps={fps}
          />
          <SettingsModal
            durationInFrames={durationInFrames}
            onDurationChange={onDurationChange}
            fps={fps}
            onFpsChange={onFpsChange}
          />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col bg-background min-w-0 h-full">
      <div className="w-full h-full flex flex-col">{renderContent()}</div>
    </div>
  );
};
