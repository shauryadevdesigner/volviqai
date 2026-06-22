import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  getInputProps,
} from "remotion";
import type { CompositionAudioProps } from "@/types/audio";
import { compileCode } from "./compiler";
import { CompositionAudio } from "./CompositionAudio";

const COMPOSITION_NAME = "DynamicComp";

interface DynamicCompProps {
  code: string;
  audio?: CompositionAudioProps;
  [key: string]: unknown;
}

export const DynamicComp: React.FC = () => {
  const inputProps = getInputProps() as DynamicCompProps;
  const { code, audio } = inputProps;

  const [handle] = useState(() => delayRender("Compiling code..."));
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const result = compileCode(code);

      if (result.error) {
        setError(result.error);
      } else {
        setComponent(() => result.Component);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error(`[${COMPOSITION_NAME}] Compilation failed:`, message);
      setError(message);
    } finally {
      continueRender(handle);
    }
  }, [code, handle]);

  if (error) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            color: "#ff6b6b",
            fontSize: 42,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          Compilation Error
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 24,
            fontFamily: "monospace",
            marginTop: 24,
            textAlign: "center",
            maxWidth: "80%",
            wordBreak: "break-word",
          }}
        >
          {error}
        </div>
      </AbsoluteFill>
    );
  }

  if (!Component) {
    return null;
  }

  try {
    return (
      <AbsoluteFill>
        <Component />
        <CompositionAudio audio={audio} />
      </AbsoluteFill>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown render error";
    console.error(`[${COMPOSITION_NAME}] Runtime render error:`, message);
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            color: "#ff6b6b",
            fontSize: 42,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          Runtime Error
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 24,
            fontFamily: "monospace",
            marginTop: 24,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {message}
        </div>
      </AbsoluteFill>
    );
  }
};
