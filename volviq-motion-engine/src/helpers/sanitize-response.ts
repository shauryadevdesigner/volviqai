export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Strip markdown code fences from a string.
 * Handles ```tsx, ```ts, ```jsx, ```js and plain ``` fences.
 */
export function stripMarkdownFences(code: string): string {
  let result = code;
  result = result.replace(/^```(?:tsx?|jsx?)?\n?/, "");
  result = result.replace(/\n?```\s*$/, "");
  return result.trim();
}

/**
 * Lightweight validation to check if GPT response contains JSX content.
 * This is a fallback check after the LLM pre-validation.
 */
export function validateGptResponse(response: string): ValidationResult {
  const trimmed = response.trim();

  // Check for JSX-like content (at least one opening tag)
  // Matches: <ComponentName, <div, <span, etc.
  const hasJsx = /<[A-Z][a-zA-Z]*|<[a-z]+[^>]*>/.test(trimmed);
  if (!hasJsx) {
    return {
      isValid: false,
      error:
        "The response was not a valid motion graphics component. Please try a different prompt.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Extract only the component code, removing any trailing text/commentary.
 * Uses brace counting to find the end of the component.
 */
export function extractComponentCode(code: string): string {
  // Find the component declaration start (robust regex supporting arrow and standard functions with optional exports and types)
  const exportMatch = code.match(
    /(?:export\s+)?(?:default\s+)?(?:(?:const|let|var)\s+\w+\s*(?::\s*[^=]+)?\s*=\s*\([^)]*\)\s*=>|(?:function\s+\w+\s*\([^)]*\)))\s*\{/
  );

  if (exportMatch && exportMatch.index !== undefined) {
    const declarationStart = exportMatch.index;
    const bodyStart = declarationStart + exportMatch[0].length;

    // Count braces to find the matching closing brace
    let braceCount = 1;
    let lastBalancedIndex = -1;

    for (let i = bodyStart; i < code.length; i++) {
      const char = code[i];
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          lastBalancedIndex = i;
        }
      }
    }

    if (lastBalancedIndex !== -1) {
      // Return everything from start of code to the last balanced closing brace
      let result = code.slice(0, lastBalancedIndex + 1);
      // Add semicolon if not present
      if (!result.trim().endsWith(";")) {
        result = result.trimEnd() + ";";
      }
      return result.trim();
    }

    // Truncation detected: braces didn't balance. Auto-close the component.
    console.warn(`[extractComponentCode] Truncated code detected: ${braceCount} unclosed brace(s). Auto-closing...`);
    let truncatedResult = code.slice(declarationStart).trimEnd();

    // Check if there's a return statement
    const hasReturn = /return\s*\(/.test(truncatedResult) || /return\s*</.test(truncatedResult);
    if (!hasReturn) {
      truncatedResult += '\n  return null;';
    }

    // Close unclosed braces
    for (let i = 0; i < braceCount; i++) {
      truncatedResult += '\n}';
    }

    if (!truncatedResult.trimEnd().endsWith(";")) {
      truncatedResult = truncatedResult.trimEnd() + ";";
    }

    // Prepend any helper functions that appeared before the component
    const helpers = code.slice(0, declarationStart).trim();
    if (helpers) {
      return `${helpers}\n\n${truncatedResult}`.trim();
    }
    return truncatedResult.trim();
  }

  // Fallback: return as-is
  return code;
}

/**
 * Validate the structural integrity of generated JSX/TSX code.
 * Checks bracket balance and detects common LLM generation errors.
 * Returns the code with auto-repairs applied, or the original if valid.
 */
export function validateAndRepairJSX(code: string): {
  code: string;
  isValid: boolean;
  repairs: string[];
} {
  const repairs: string[] = [];
  let repaired = code;

  // ── Repair: Remove stray backslashes from JSX tags ─────────────────────
  const originalCodeForBackslash = repaired;
  repaired = repaired.replace(/<\s*([\\/]+)\s*([a-zA-Z_$][a-zA-Z0-9_$-]*)/g, (match, slashes, tagName) => {
    if (slashes.includes('\\')) {
      return '</' + tagName;
    }
    return match;
  });
  repaired = repaired.replace(/([\\/]+)\s*>/g, (match, slashes) => {
    if (slashes.includes('\\')) {
      return ' />';
    }
    return match;
  });
  if (repaired !== originalCodeForBackslash) {
    repairs.push("Removed stray backslashes from JSX tags");
  }

  // ── Check bracket balance ─────────────────────────────────────────────
  let braceCount = 0;
  let parenCount = 0;
  let inString = false;
  let stringChar = "";
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    const next = i + 1 < repaired.length ? repaired[i + 1] : "";
    const prev = i > 0 ? repaired[i - 1] : "";

    if (ch === "\n") { inLineComment = false; continue; }
    if (inBlockComment) { if (ch === "*" && next === "/") { inBlockComment = false; i++; } continue; }
    if (inLineComment) continue;
    if (!inString && !inTemplate && ch === "/" && next === "/") { inLineComment = true; continue; }
    if (!inString && !inTemplate && !inBlockComment && ch === "/" && next === "*") { inBlockComment = true; i++; continue; }
    if (!inString && !inTemplate && (ch === "'" || ch === '"') && prev !== "\\") {
      if (!inString) { inString = true; stringChar = ch; } else if (ch === stringChar) { inString = false; }
      continue;
    }
    if (!inString && ch === "`" && prev !== "\\") { inTemplate = !inTemplate; continue; }
    if (inString || inTemplate) continue;

    if (ch === "{") braceCount++;
    if (ch === "}") braceCount--;
    if (ch === "(") parenCount++;
    if (ch === ")") parenCount--;
  }

  // ── Fix extra closing parentheses in map/filter patterns ──────────────
  repaired = repaired.replace(/\)\)\)\}/g, (match, offset) => {
    const context = repaired.slice(Math.max(0, offset - 200), offset);
    const mapCount = (context.match(/\.map\s*\(/g) || []).length;
    const closedMaps = (context.match(/\)\)\}/g) || []).length;
    if (mapCount - closedMaps >= 2) return match;
    repairs.push("Fixed triple-close pattern ')))}' → '))}'");
    return "))}";
  });

  // ── Fix unbalanced braces & parentheses ───────────────────────────────
  if (braceCount > 0) {
    for (let i = 0; i < braceCount; i++) repaired = repaired.trimEnd() + "\n}";
    repairs.push(`Added ${braceCount} missing closing brace(s)`);
  } else if (braceCount < 0 || parenCount < 0) {
    let trimmed = repaired.trimEnd();
    let removedBraces = 0;
    let removedParens = 0;
    let changed = true;
    while (changed && (braceCount < 0 || parenCount < 0)) {
      changed = false;
      if (braceCount < 0 && trimmed.endsWith("}")) {
        trimmed = trimmed.slice(0, -1).trimEnd();
        braceCount++;
        removedBraces++;
        changed = true;
      }
      if (parenCount < 0 && trimmed.endsWith(")")) {
        trimmed = trimmed.slice(0, -1).trimEnd();
        parenCount++;
        removedParens++;
        changed = true;
      }
      if (trimmed.endsWith(";")) {
        trimmed = trimmed.slice(0, -1).trimEnd();
        changed = true;
      }
    }
    repaired = trimmed;
    if (removedBraces > 0) repairs.push(`Removed ${removedBraces} extra closing brace(s)`);
    if (removedParens > 0) repairs.push(`Removed ${removedParens} extra closing parenthesis(es)`);
  }

  if (parenCount > 0) {
    for (let i = 0; i < parenCount; i++) repaired = repaired.trimEnd() + "\n)";
    repairs.push(`Added ${parenCount} missing closing parenthesis(es)`);
  }

  // ── Ensure component ends with semicolon ──────────────────────────────
  const trimmedEnd = repaired.trimEnd();
  if (trimmedEnd.endsWith("}") && !trimmedEnd.endsWith("};")) {
    repaired = trimmedEnd + ";";
    repairs.push("Added missing semicolon at end of component");
  }

  if (repairs.length > 0) {
    console.log(`[JSX Validator] Server-side repairs applied: ${repairs.join("; ")}`);
  }

  return {
    code: repaired,
    isValid: repairs.length === 0,
    repairs,
  };
}
