import { validateAndRepairJSX } from "../../../helpers/sanitize-response";
import { CodeValidationResult } from "../types";

export function runStage9(code: string): CodeValidationResult {
  const result = validateAndRepairJSX(code);
  return {
    isValid: result.isValid,
    fixedCode: result.code,
    repairsApplied: result.repairs,
  };
}
