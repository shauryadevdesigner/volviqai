import * as Babel from "@babel/standalone";
import { repairGeneratedCode } from "./jsx-validator";
import { Audio } from "@remotion/media";
import { Lottie } from "@remotion/lottie";
import * as RemotionShapes from "@remotion/shapes";
import { ThreeCanvas } from "@remotion/three";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";
import { SPRINGS, SPACING, BORDER_RADIUS, SHADOWS, GLOWS, BLURS } from "../ai/design-tokens";
import {
  HeroHeadline,
  GradientBackground,
  GlassCard,
  FeatureGrid,
  PremiumCTA,
  KineticText,
  AnimatedNumber,
  LogoWall
} from "../ai/components-library";

// Safe wrapper for ThreeCanvas that auto-injects width/height from useVideoConfig
// This prevents runtime errors when AI-generated code omits these required props
const SafeThreeCanvas: React.FC<any> = (props) => {
  const { width, height } = useVideoConfig();
  return React.createElement(ThreeCanvas, { width, height, ...props });
};

// Safe wrapper for Sequence to default from/durationInFrames if invalid
const SafeSequence: React.FC<any> = ({ from, durationInFrames, ...props }) => {
  const parsedFrom = typeof from === 'string' ? parseFloat(from) : from;
  const safeFrom = typeof parsedFrom === 'number' && !isNaN(parsedFrom) && parsedFrom >= 0 ? Math.round(parsedFrom) : 0;
  
  if (durationInFrames !== undefined) {
    const parsedDuration = typeof durationInFrames === 'string' ? parseFloat(durationInFrames) : durationInFrames;
    const safeDuration = typeof parsedDuration === 'number' && !isNaN(parsedDuration) && parsedDuration > 0 ? Math.round(parsedDuration) : 30;
    return React.createElement(Sequence, {
      from: safeFrom,
      durationInFrames: safeDuration,
      ...props
    });
  }
  
  return React.createElement(Sequence, {
    from: safeFrom,
    ...props
  });
};

// Safe wrapper for Img to handle missing/invalid src and render a fallback
const SafeImg: React.FC<any> = ({ src, alt, style, ...props }) => {
  const isValidSrc = typeof src === 'string' && src.trim().length > 0;
  
  if (!isValidSrc) {
    return React.createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '14px',
        fontWeight: 500,
        ...style
      },
      ...props
    }, alt || "Image Asset");
  }
  return React.createElement(Img, { src, alt, style, ...props });
};

export interface CompilationResult {
  Component: React.ComponentType | null;
  error: string | null;
}

  // Strip imports and extract component body from LLM-generated code
  // Safety layer in case LLM includes full ES6 syntax despite instructions
function extractComponentBody(code: string): string {
  let cleaned = code;

  // Remove type imports
  cleaned = cleaned.replace(/import\s+type\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  // Remove combined default + named imports
  cleaned = cleaned.replace(/import\s+\w+\s*,\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  // Remove multi-line named imports
  cleaned = cleaned.replace(/import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  // Remove namespace imports
  cleaned = cleaned.replace(/import\s+\*\s+as\s+\w+\s+from\s*["'][^"']+["'];?/g, "");
  // Remove default imports
  cleaned = cleaned.replace(/import\s+\w+\s+from\s*["'][^"']+["'];?/g, "");
  // Remove side-effect imports
  cleaned = cleaned.replace(/import\s*["'][^"']+["'];?/g, "");

  cleaned = cleaned.trim();

  // Identify the name of the exported component (if any)
  let componentName: string | null = null;
  
  // Look for "export default function Name"
  const defaultFnMatch = cleaned.match(/export\s+default\s+function\s+(\w+)/);
  // Look for "export default class Name"
  const defaultClassMatch = cleaned.match(/export\s+default\s+class\s+(\w+)/);
  // Look for "export default Name;"
  const defaultExportMatch = cleaned.match(/export\s+default\s+(?!function\b|class\b)(\w+)\s*;?/);
  
  if (defaultFnMatch) {
    componentName = defaultFnMatch[1];
  } else if (defaultClassMatch) {
    componentName = defaultClassMatch[1];
  } else if (defaultExportMatch) {
    componentName = defaultExportMatch[1];
  } else {
    // Look for "export { Name as default }" or "export { Name }"
    const namedExportMatch = cleaned.match(/export\s*\{\s*(\w+)(?:\s+as\s+default)?\s*\}\s*;?/);
    if (namedExportMatch) {
      componentName = namedExportMatch[1];
    }
  }

  if (!componentName) {
    const namedConstExportMatch = cleaned.match(/export\s+(?:const|let|var)\s+(\w+)\s*=/);
    if (namedConstExportMatch) {
      componentName = namedConstExportMatch[1];
    }
  }

  // Find the component start match using several strategies
  let startMatch: RegExpMatchArray | null = null;

  // Strategy A: If we know the component name, look for its declaration
  if (componentName) {
    const escapedName = componentName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const componentRegex = new RegExp(
      `([\\s\\S]*?)(?:export\\s+)?(?:default\\s+)?(?:(?:const|let|var)\\s+${escapedName}\\s*(?::\\s*[^=]+)?\\s*=\\s*\\([^)]*\\)\\s*=>|(?:function\\s+${escapedName}\\s*\\([^)]*\\)))\\s*\\{`
    );
    startMatch = cleaned.match(componentRegex);
  }

  // Strategy B: Look for any exported arrow function: export const Component = () => {
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)export\s+(?:default\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }

  // Strategy C: Look for any exported standard function: export function Component() {
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)export\s+(?:default\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
  }

  // Strategy D: Look for any const component declaration that matches typical names
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)(?:const|let|var)\s+(VolviqAd|VolviqAnimation|MyAnimation|Animation|AdComponent|DynamicComponent)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }

  // Strategy D2: Look for any standard function declaration that matches typical names
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)function\s+(VolviqAd|VolviqAnimation|MyAnimation|Animation|AdComponent|DynamicComponent)\s*\([^)]*\)\s*\{/);
  }

  // Strategy E: Fallback to the last const assignment of an arrow function
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }

  // Strategy E2: Fallback to the last standard function definition
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)(?:export\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
  }

  const cleanExports = (str: string) => {
    return str
      .replace(/export\s+default\s+(function|class)\b/g, "$1")
      .replace(/export\s+(const|let|var|function|class)\b/g, "$1")
      .replace(/export\s+default\s+(?!function\b|class\b)\w+\s*;?/g, "")
      .replace(/export\s*\{\s*[\s\S]*?\}\s*;?/g, "")
      .trim();
  };

  if (startMatch) {
    const helpers = startMatch[1].trim();
    const afterExport = cleaned.substring(startMatch[0].length);
    
    // Find the last closing brace and strip everything after it
    const lastBraceIndex = afterExport.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      const body = afterExport.substring(0, lastBraceIndex).trim();
      const cleanHelpers = cleanExports(helpers);
      const cleanBody = cleanExports(body);
      return cleanHelpers ? `${cleanHelpers}\n\n${cleanBody}` : cleanBody;
    }
  }

  // Fallback if not matched (e.g. if the AI just output the body)
  return cleanExports(cleaned);
}

// Detect and repair truncated code (from token limit cutoff)
// When AI output hits the token limit, the component code is cut mid-function,
// causing Babel to fail with syntax errors ("No Block" error).
function repairTruncatedCode(code: string): { code: string; wasTruncated: boolean } {
  // Count unmatched braces
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = i + 1 < code.length ? code[i + 1] : '';
    const prev = i > 0 ? code[i - 1] : '';

    // Handle comments
    if (!inString && !inTemplate && !inBlockComment && char === '/' && next === '/') {
      inLineComment = true;
      continue;
    }
    if (inLineComment && char === '\n') {
      inLineComment = false;
      continue;
    }
    if (inLineComment) continue;

    if (!inString && !inTemplate && !inBlockComment && char === '/' && next === '*') {
      inBlockComment = true;
      i++; // skip *
      continue;
    }
    if (inBlockComment && char === '*' && next === '/') {
      inBlockComment = false;
      i++; // skip /
      continue;
    }
    if (inBlockComment) continue;

    // Handle strings
    if (!inString && !inTemplate && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      continue;
    }
    if (inString && char === stringChar && prev !== '\\') {
      inString = false;
      continue;
    }
    if (inString) continue;

    // Handle template literals
    if (!inString && !inTemplate && char === '`') {
      inTemplate = true;
      continue;
    }
    if (inTemplate && char === '`' && prev !== '\\') {
      inTemplate = false;
      continue;
    }
    if (inTemplate) continue;

    // Count braces
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }

  // If braces are balanced, no truncation
  if (braceCount <= 0) {
    return { code, wasTruncated: false };
  }

  console.warn(`[Compiler] Detected truncated code: ${braceCount} unclosed brace(s). Auto-repairing...`);

  // Check if the code contains a return statement
  const hasReturn = /return\s*\(/.test(code) || /return\s*</.test(code);

  let repaired = code.trimEnd();

  // If no return statement found, add a fallback return
  if (!hasReturn) {
    repaired += '\n  return null;';
  }

  // Close unclosed braces
  for (let i = 0; i < braceCount; i++) {
    repaired += '\n}';
  }

  // Add semicolon if needed
  if (!repaired.trimEnd().endsWith(';')) {
    repaired += ';';
  }

  return { code: repaired, wasTruncated: true };
}

// Standalone compile function for use outside React components
export function compileCode(code: string): CompilationResult {
  if (!code?.trim()) {
    return { Component: null, error: "No code provided" };
  }

  try {
    // Detect and repair truncated code before extraction
    const { code: repairedCode, wasTruncated } = repairTruncatedCode(code);

    const rawComponentBody = extractComponentBody(repairedCode);

    if (!rawComponentBody.trim()) {
      return {
        Component: null,
        error: wasTruncated
          ? "Code was truncated during generation. The AI ran out of output space. Please try a simpler prompt or regenerate."
          : "Could not extract component body from the generated code.",
      };
    }

    // ── JSX Validation & Auto-Repair ──────────────────────────────────────
    // Run structural repair on the component body before Babel transpilation.
    // This catches common LLM errors: unbalanced braces, extra parens,
    // missing commas in style objects, and malformed map/filter patterns.
    const { code: validatedBody, repairs } = repairGeneratedCode(rawComponentBody);
    const componentBody = validatedBody;
    if (repairs.length > 0) {
      console.log(`[Compiler] JSX auto-repairs applied: ${repairs.join("; ")}`);
    }

    const wrappedSource = `const DynamicAnimation = () => {\n${componentBody}\n};`;

    const transpiled = Babel.transform(wrappedSource, {
      presets: ["react", "typescript"],
      filename: "dynamic-animation.tsx",
    });

    if (!transpiled.code) {
      return { Component: null, error: "Transpilation failed" };
    }

    // Safe interpolate wrapper: validates that outputRange contains only numbers
    // AI often passes strings (colors, percentages) which crashes Remotion
    const safeInterpolate: typeof interpolate = (input, inputRange, outputRange, options) => {
      try {
        // Ensure all outputRange values are numbers
        const safeOutputRange = outputRange.map((v: any) => {
          if (typeof v === 'number' && !isNaN(v)) return v;
          const parsed = parseFloat(v);
          return isNaN(parsed) ? 0 : parsed;
        });
        // Ensure all inputRange values are numbers
        const safeInputRange = inputRange.map((v: any) => {
          if (typeof v === 'number' && !isNaN(v)) return v;
          const parsed = parseFloat(v);
          return isNaN(parsed) ? 0 : parsed;
        });
        // Ensure input is a number
        const safeInput = typeof input === 'number' && !isNaN(input) ? input : 0;
        return interpolate(safeInput, safeInputRange, safeOutputRange, options);
      } catch {
        // If all else fails, return first output value or 0
        return typeof outputRange?.[0] === 'number' ? outputRange[0] : 0;
      }
    };

    // Safe spring wrapper: catches invalid config
    const safeSpring: typeof spring = (args) => {
      try {
        return spring(args);
      } catch {
        return 0;
      }
    };

    const Remotion = {
      AbsoluteFill,
      interpolate: safeInterpolate,
      useCurrentFrame,
      useVideoConfig,
      spring: safeSpring,
      Sequence: SafeSequence,
      Img: SafeImg,
      staticFile,
    };

    const wrappedCode = `${transpiled.code}\nreturn DynamicAnimation;`;
    const userImages = (typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).__userImages : []) || [];

    const createComponent = new Function(
      "React",
      "Remotion",
      "RemotionShapes",
      "Lottie",
      "Audio",
      "ThreeCanvas",
      "THREE",
      "AbsoluteFill",
      "interpolate",
      "useCurrentFrame",
      "useVideoConfig",
      "spring",
      "Sequence",
      "Img",
      "staticFile",
      "useState",
      "useEffect",
      "useMemo",
      "useRef",
      "Rect",
      "Circle",
      "Triangle",
      "Star",
      "Polygon",
      "Ellipse",
      "Heart",
      "Pie",
      "makeRect",
      "makeCircle",
      "makeTriangle",
      "makeStar",
      "makePolygon",
      "makeEllipse",
      "makeHeart",
      "makePie",
      // Transitions
      "TransitionSeries",
      "linearTiming",
      "springTiming",
      "fade",
      "slide",
      "wipe",
      "flip",
      "clockWipe",
      "userImages",
      // Design Tokens & Premium Components Injection
      "SPRINGS",
      "SPACING",
      "BORDER_RADIUS",
      "SHADOWS",
      "GLOWS",
      "BLURS",
      "FONTS",
      "HeroHeadline",
      "GradientBackground",
      "GlassCard",
      "FeatureGrid",
      "PremiumCTA",
      "KineticText",
      "AnimatedNumber",
      "LogoWall",
      wrappedCode,
    );

    const SafeReact = {
      ...React,
      createElement: function (type: any, props: any, ...children: any[]) {
        if (props && props.style && typeof props.style === "object") {
          const newStyle = { ...props.style };
          for (const key in newStyle) {
            if (typeof newStyle[key] === "symbol") {
              newStyle[key] = String(newStyle[key]);
            }
          }
          const ownSymbols = Object.getOwnPropertySymbols(newStyle);
          for (const sym of ownSymbols) {
            newStyle[String(sym)] = newStyle[sym];
            delete newStyle[sym];
          }
          props.style = newStyle;
        }
        return React.createElement(type, props, ...children);
      },
    };

    const Component = createComponent(
      SafeReact,
      Remotion,
      RemotionShapes,
      Lottie,
      Audio,
      SafeThreeCanvas,
      THREE,
      AbsoluteFill,
      safeInterpolate,
      useCurrentFrame,
      useVideoConfig,
      safeSpring,
      SafeSequence,
      SafeImg,
      staticFile,
      useState,
      useEffect,
      useMemo,
      useRef,
      RemotionShapes.Rect,
      RemotionShapes.Circle,
      RemotionShapes.Triangle,
      RemotionShapes.Star,
      RemotionShapes.Polygon,
      RemotionShapes.Ellipse,
      RemotionShapes.Heart,
      RemotionShapes.Pie,
      RemotionShapes.makeRect,
      RemotionShapes.makeCircle,
      RemotionShapes.makeTriangle,
      RemotionShapes.makeStar,
      RemotionShapes.makePolygon,
      RemotionShapes.makeEllipse,
      RemotionShapes.makeHeart,
      RemotionShapes.makePie,
      // Transitions
      TransitionSeries,
      linearTiming,
      springTiming,
      fade,
      slide,
      wipe,
      flip,
      clockWipe,
      userImages,
      // Design Tokens & Premium Components Injection
      SPRINGS,
      SPACING,
      BORDER_RADIUS,
      SHADOWS,
      GLOWS,
      BLURS,
      {
        heading: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
        display: "'Space Grotesk', sans-serif",
        accent: "'Playfair Display', serif",
      }, // FONTS
      HeroHeadline,
      GradientBackground,
      GlassCard,
      FeatureGrid,
      PremiumCTA,
      KineticText,
      AnimatedNumber,
      LogoWall,
    );

    if (typeof Component !== "function") {
      return {
        Component: null,
        error: "Code must be a function that returns a React component",
      };
    }

    return { Component, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown compilation error";
    return { Component: null, error: errorMessage };
  }
}

/**
 * Checks for common AI code generation issues specific to Remotion/React.
 */
export function verifyRemotionConstraints(code: string): string[] {
  const errors: string[] = [];

  // 1. Check interpolate calls for invalid outputRange values (non-numeric strings or units)
  const interpolateRegex = /interpolate\s*\(\s*([^,]+)\s*,\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]/g;
  let match;
  while ((match = interpolateRegex.exec(code)) !== null) {
    const outputRange = match[3];
    // Check if outputRange contains letters (excluding e, e-01 etc. for scientific notation), quotes, hex codes, or percentage signs.
    // Allow digits, spaces, dots, commas, minus signs, and scientific notation exponents (e.g. 1e-5).
    const cleanedRange = outputRange
      .replace(/[a-zA-Z_$][a-zA-Z0-9_$]*/g, "")
      .replace(/[+*/()]/g, "")
      .replace(/[\d\s.,\-e]/gi, "");
    if (cleanedRange.length > 0) {
      errors.push(
        `interpolate() output range must contain ONLY numeric values. Found non-numeric characters or units in outputRange: [${outputRange.trim()}]. Animating non-numeric properties like color strings or percentage units directly inside interpolate() is invalid in Remotion. Animate numeric values instead (e.g. 0 to 1, or 0 to 100) and append units/colors in styles.`
      );
    }
  }

  // 2. Check Sequence tags: Sequence should have 'from' and 'durationInFrames'
  const sequenceMatches = code.match(/<Sequence[^>]*>/g);
  if (sequenceMatches) {
    for (const seq of sequenceMatches) {
      const hasFrom = /\bfrom\b\s*=/.test(seq);
      const hasDuration = /\bdurationInFrames\b\s*=/.test(seq);
      if (!hasFrom) {
        errors.push(`Sequence tag is missing 'from' property: ${seq}. Every <Sequence> must specify a 'from' frame.`);
      }
      if (!hasDuration) {
        errors.push(`Sequence tag is missing 'durationInFrames' property: ${seq}. Every <Sequence> must specify 'durationInFrames'.`);
      }
    }
  }

  // 3. Check for raw browser window/document usage outside checks
  const hasBrowserGlobals = /\b(?:window|document)\b/.test(code);
  if (hasBrowserGlobals) {
    const hasWindowCheck = /typeof\s+window\s*!==?\s*['"]undefined['"]/.test(code) || /typeof\s+window\s*===?\s*['"]undefined['"]/.test(code);
    if (!hasWindowCheck) {
      errors.push(`Found raw 'window' or 'document' usage without standard environment verification. Wrap browser-specific calls in 'typeof window !== "undefined"' check to ensure SSR compile-safety.`);
    }
  }

  return errors;
}

/**
 * Combines static validation constraints and Babel transpilation + execution validation.
 */
export function verifyAndCompile(code: string): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  // Run static checks
  const constraintErrors = verifyRemotionConstraints(code);
  errors.push(...constraintErrors);

  // Run Babel compilation checks
  const result = compileCode(code);
  if (result.error) {
    errors.push(result.error);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
