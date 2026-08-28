"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Player } from "@remotion/player";
import { COMP_NAME } from "../../../types/constants";
import { useSearchParams } from "next/navigation";

import { ErrorBoundary } from "react-error-boundary";

export default function RenderTargetPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", padding: 20 }}>Loading search params...</div>}>
      <RenderTargetContent />
    </Suspense>
  );
}

function RenderTargetContent() {
  const searchParams = useSearchParams();
  const [component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);

  const codeBase64 = searchParams.get("code");
  const durationInFramesStr = searchParams.get("durationInFrames");
  
  const durationInFrames = durationInFramesStr ? parseInt(durationInFramesStr, 10) : 150;

  useEffect(() => {
    if (!codeBase64) {
      setError("No code provided in URL");
      return;
    }

    try {
      const code = decodeURIComponent(escape(atob(codeBase64)));
      
      const compile = async () => {
        try {
          const { transform } = await import("sucrase");
          const compiled = transform(code, {
            transforms: ["jsx", "typescript", "imports"],
            production: true,
          }).code;

          const exports: Record<string, any> = {};
          const requireMock = (moduleName: string) => {
            if (moduleName === "react") return React;
            if (moduleName.startsWith("remotion")) return require("remotion");
            if (moduleName === "@remotion/shapes") return require("@remotion/shapes");
            throw new Error(`Module ${moduleName} not found`);
          };

          const func = new Function("exports", "require", "React", compiled);
          func(exports, requireMock, React);

          const Comp = exports.default || exports[COMP_NAME];
          if (Comp) {
            setComponent(() => Comp);
          } else {
            throw new Error(`Component not found in exports. Expected default export or ${COMP_NAME}`);
          }
        } catch (e: any) {
          setError(e.message || "Failed to compile Remotion code");
        }
      };

      compile();
    } catch (err: any) {
      setError("Failed to decode base64 code: " + err.message);
    }
  }, [codeBase64]);

  if (error) {
    return <div style={{ color: "red", padding: 20 }}>Error: {error}</div>;
  }

  if (!component) {
    return <div style={{ color: "white", padding: 20 }}>Loading player...</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}>
      <ErrorBoundary fallback={<div style={{ color: "red" }}>Error rendering component</div>}>
        <Player
          component={component}
          inputProps={{}}
          durationInFrames={durationInFrames}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: "100%",
            height: "100%",
          }}
          autoPlay={true}
          loop={false}
          controls={false}
        />
      </ErrorBoundary>
    </div>
  );
}
