import { transform } from "sucrase";
import { repairGeneratedCode } from "./jsx-validator";

function repairTruncatedCode(code: string): { code: string; wasTruncated: boolean } {
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
      i++;
      continue;
    }
    if (inBlockComment && char === '*' && next === '/') {
      inBlockComment = false;
      i++;
      continue;
    }
    if (inBlockComment) continue;

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

    if (!inString && !inTemplate && char === '`') {
      inTemplate = true;
      continue;
    }
    if (inTemplate && char === '`' && prev !== '\\') {
      inTemplate = false;
      continue;
    }
    if (inTemplate) continue;

    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }

  if (braceCount <= 0) {
    return { code, wasTruncated: false };
  }

  console.warn(`[Compiler-Server] Detected truncated code: ${braceCount} unclosed brace(s). Auto-repairing...`);

  const hasReturn = /return\s*\(/.test(code) || /return\s*</.test(code);
  let repaired = code.trimEnd();

  if (!hasReturn) {
    repaired += '\n  return null;';
  }

  for (let i = 0; i < braceCount; i++) {
    repaired += '\n}';
  }

  if (!repaired.trimEnd().endsWith(';')) {
    repaired += ';';
  }

  return { code: repaired, wasTruncated: true };
}

export function verifyRemotionConstraints(code: string): string[] {
  const errors: string[] = [];

  const interpolateRegex = /interpolate\s*\(\s*([^,]+)\s*,\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]/g;
  let match;
  while ((match = interpolateRegex.exec(code)) !== null) {
    const outputRange = match[3];
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

  const hasBrowserGlobals = /\b(?:window|document)\b/.test(code);
  if (hasBrowserGlobals) {
    const hasWindowCheck = /typeof\s+window\s*!==?\s*['"]undefined['"]/.test(code) || /typeof\s+window\s*===?\s*['"]undefined['"]/.test(code);
    if (!hasWindowCheck) {
      errors.push(`Found raw 'window' or 'document' usage without standard environment verification. Wrap browser-specific calls in 'typeof window !== "undefined"' check to ensure SSR compile-safety.`);
    }
  }

  return errors;
}

export function verifyAndCompileServer(code: string): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  const constraintErrors = verifyRemotionConstraints(code);
  errors.push(...constraintErrors);

  if (!code?.trim()) {
    return { success: false, errors: ["No code provided"] };
  }

  try {
    const { code: repairedCode, wasTruncated } = repairTruncatedCode(code);
    if (wasTruncated) {
      return {
        success: false,
        errors: ["The generated TSX module was truncated before completion."],
      };
    }

    const { code: moduleCode } = repairGeneratedCode(repairedCode);

    // Validate the complete module directly. Extracting the component body and
    // wrapping it in another arrow function corrupts valid modules containing
    // helpers, typed subcomponents, or complex export declarations.
    const transpiled = transform(moduleCode, {
      transforms: ["jsx", "typescript", "imports"],
    });

    if (!transpiled.code) {
      return { success: false, errors: ["Transpilation failed"] };
    }

    // Transpilation successful implies syntax is valid.
    // Edge Runtime does not allow 'new Function', so we skip execution validation here.

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown compilation error";
    errors.push(errorMessage);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
