import { validateAndRepairJSX } from "../../../helpers/sanitize-response";
import { CodeValidationResult } from "../types";

export function runStage9(code: string): CodeValidationResult {
  const result = validateAndRepairJSX(code);
  // Models occasionally use interpolate() for literal color ranges. Remotion
  // requires interpolateColors() for that operation. Repair the API name
  // before compilation instead of failing an otherwise valid AI draft.
  const colorInterpolationPattern = /\binterpolate(?=\s*\(\s*[^,]+,\s*\[[^\]]*\],\s*\[\s*["']\s*(?:#(?:[0-9a-f]{3,8})\b|rgba?\(|hsla?\())/gi;
  let fixedCode = result.code.replace(colorInterpolationPattern, "interpolateColors");
  const repairedColorInterpolation = fixedCode !== result.code;
  if (repairedColorInterpolation && !/import\s*\{[^}]*\binterpolateColors\b[^}]*\}\s*from\s*["']remotion["']/.test(fixedCode)) {
    fixedCode = `import {interpolateColors} from "remotion";\n${fixedCode}`;
  }
  return {
    isValid: result.isValid,
    fixedCode,
    repairsApplied: repairedColorInterpolation
      ? [...result.repairs, "Converted color interpolate() calls to interpolateColors()"]
      : result.repairs,
  };
}
