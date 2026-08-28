"use client";

import { useCallback, useEffect, useState } from "react";
import {
  compileCode as compile,
  type CompilationResult,
} from "../remotion/compiler";

export interface AnimationState {
  code: string;
  Component: React.ComponentType | null;
  error: string | null;
  isCompiling: boolean;
  is3D: boolean;
}

// Check if code contains Three.js/React Three Fiber patterns
// Only detect as 3D if it actually uses 3D elements (Canvas, mesh, geometries)
function is3DCode(code: string): boolean {
  // Must have Canvas to be 3D
  if (!code.includes("Canvas") && !code.includes("canvas")) return false;
  // Must have 3D elements
  const has3DElements = (
    code.includes("mesh") ||
    code.includes("sphereGeometry") ||
    code.includes("boxGeometry") ||
    code.includes("icosahedronGeometry") ||
    code.includes("torusGeometry") ||
    code.includes("Stars") ||
    code.includes("Sparkles") ||
    code.includes("Float") ||
    code.includes("OrbitControls") ||
    code.includes("Environment") ||
    code.includes("@react-three/fiber") ||
    code.includes("@react-three/drei")
  );
  return has3DElements;
}

export function useAnimationState(initialCode: string = "") {
  const [state, setState] = useState<AnimationState>({
    code: initialCode,
    Component: null,
    error: null,
    isCompiling: false,
    is3D: false,
  });

  // Compile code when it changes (with debouncing handled by caller)
  const compileCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, isCompiling: true }));

    const result: CompilationResult = compile(code);
    const codeIs3D = is3DCode(code);

    setState((prev) => ({
      ...prev,
      Component: result.Component,
      error: result.error,
      isCompiling: false,
      is3D: codeIs3D,
    }));
  }, []);

  // Update code and trigger compilation
  const setCode = useCallback((newCode: string) => {
    setState((prev) => ({ ...prev, code: newCode }));
  }, []);

  // Auto-compile when component mounts with initial code
  useEffect(() => {
    if (initialCode) {
      compileCode(initialCode);
    }
  }, []);

  return {
    ...state,
    setCode,
    compileCode,
  };
}
