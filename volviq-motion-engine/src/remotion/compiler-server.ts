import { transform } from "sucrase";
import { repairGeneratedCode } from "./jsx-validator";

function extractComponentBody(code: string): string {
  let cleaned = code;

  cleaned = cleaned.replace(/import\s+type\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s+\w+\s*,\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s+\*\s+as\s+\w+\s+from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s+\w+\s+from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s*["'][^"']+["'];?/g, "");

  cleaned = cleaned.trim();

  let componentName: string | null = null;
  const defaultFnMatch = cleaned.match(/export\s+default\s+function\s+(\w+)/);
  const defaultClassMatch = cleaned.match(/export\s+default\s+class\s+(\w+)/);
  const defaultExportMatch = cleaned.match(/export\s+default\s+(?!function\b|class\b)(\w+)\s*;?/);
  
  if (defaultFnMatch) {
    componentName = defaultFnMatch[1];
  } else if (defaultClassMatch) {
    componentName = defaultClassMatch[1];
  } else if (defaultExportMatch) {
    componentName = defaultExportMatch[1];
  } else {
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

  let startMatch: RegExpMatchArray | null = null;

  if (componentName) {
    const escapedName = componentName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const componentRegex = new RegExp(
      `([\\s\\S]*?)(?:export\\s+)?(?:default\\s+)?(?:(?:const|let|var)\\s+${escapedName}\\s*(?::\\s*[^=]+)?\\s*=\\s*\\([^)]*\\)\\s*=>|(?:function\\s+${escapedName}\\s*\\([^)]*\\)))\\s*\\{`
    );
    startMatch = cleaned.match(componentRegex);
  }

  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)export\s+(?:default\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)export\s+(?:default\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
  }
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)(?:const|let|var)\s+(VolviqAd|VolviqAnimation|MyAnimation|Animation|AdComponent|DynamicComponent|DynamicAnimation)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)function\s+(VolviqAd|VolviqAnimation|MyAnimation|Animation|AdComponent|DynamicComponent|DynamicAnimation)\s*\([^)]*\)\s*\{/);
  }
  if (!startMatch) {
    startMatch = cleaned.match(/([\s\S]*?)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  }
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
    const lastBraceIndex = afterExport.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      const body = afterExport.substring(0, lastBraceIndex).trim();
      const cleanHelpers = cleanExports(helpers);
      const cleanBody = cleanExports(body);
      return cleanHelpers ? `${cleanHelpers}\n\n${cleanBody}` : cleanBody;
    }
  }

  return cleanExports(cleaned);
}

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
    const { code: repairedCode } = repairTruncatedCode(code);
    const rawComponentBody = extractComponentBody(repairedCode);

    if (!rawComponentBody.trim()) {
      return {
        success: false,
        errors: ["Could not extract component body from the generated code."],
      };
    }

    const { code: componentBody } = repairGeneratedCode(rawComponentBody);
    const wrappedSource = `const DynamicAnimation = () => {\n${componentBody}\n};`;

    const transpiled = transform(wrappedSource, {
      transforms: ["jsx", "typescript"],
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
