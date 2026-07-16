function stripMarkdownFences(code) {
  let result = code;
  result = result.replace(/^```(?:tsx?|jsx?)?\n?/, "");
  result = result.replace(/\n?```\s*$/, "");
  return result.trim();
}

function validateGptResponse(response) {
  const trimmed = response.trim();
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

function extractComponentCode(code) {
  // If the code is complete (contains the main VolviqAnimation or MyAnimation components),
  // return as-is to prevent slicing off later components due to minor unbalanced braces.
  const isComplete = code.includes("VolviqAnimation") || code.includes("MyAnimation");
  if (isComplete) {
    return code.trim();
  }

  // Find the component declaration start (robust regex supporting arrow and standard functions with optional exports and types)
  const exportMatch = code.match(
    /(?:export\s+)?(?:default\s+)?(?:(?:const|let|var)\s+\w+\s*(?::\s*[^=]+)?\s*=\s*\([^)]*\)\s*=>|(?:function\s+\w+\s*\([^)]*\)))\s*\{/
  );

  if (exportMatch && exportMatch.index !== undefined) {
    const declarationStart = exportMatch.index;
    const bodyStart = declarationStart + exportMatch[0].length;

    // Count braces to find the matching closing brace (ignoring strings, template literals, and comments)
    let braceCount = 1;
    let lastBalancedIndex = -1;
    let inString = false;
    let stringChar = "";
    let inTemplate = false;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = bodyStart; i < code.length; i++) {
      const char = code[i];
      const next = i + 1 < code.length ? code[i + 1] : "";
      const prev = i > 0 ? code[i - 1] : "";

      if (inLineComment) {
        if (char === "\n") {
          inLineComment = false;
        }
        continue;
      }
      if (inBlockComment) {
        if (char === "*" && next === "/") {
          inBlockComment = false;
          i++; // skip /
        }
        continue;
      }
      if (inString) {
        if (char === stringChar && prev !== "\\") {
          inString = false;
        }
        continue;
      }
      if (inTemplate) {
        if (char === "`" && prev !== "\\") {
          inTemplate = false;
        }
        continue;
      }

      // Check for start of comments/strings
      if (char === "/" && next === "/") {
        inLineComment = true;
        i++; // skip second slash
        continue;
      }
      if (char === "/" && next === "*") {
        inBlockComment = true;
        i++; // skip asterisk
        continue;
      }
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        continue;
      }
      if (char === "`") {
        inTemplate = true;
        continue;
      }

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

const sampleCode5 = `import React from 'react';
import { AbsoluteFill } from 'remotion';

const Scene1 = () => {
  return (
    <AbsoluteFill>
      <div>Truncated midway...`;

console.log('--- TEST 5: Genuiely truncated code ---');
const parsed5 = extractComponentCode(sampleCode5);
console.log('Parsed code:\n', parsed5);
console.log('Validation:', validateGptResponse(parsed5));
