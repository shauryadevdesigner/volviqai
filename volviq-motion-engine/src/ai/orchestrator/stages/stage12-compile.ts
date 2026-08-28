import { verifyAndCompileServer } from "../../../remotion/compiler-server";
import { CompileResult } from "../types";

export function runStage12(code: string): CompileResult {
  const result = verifyAndCompileServer(code);
  return {
    success: result.success,
    errors: result.errors,
  };
}
