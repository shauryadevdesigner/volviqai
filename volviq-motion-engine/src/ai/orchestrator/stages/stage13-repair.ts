import { z } from "zod";
import { generateContent } from "../../provider";
import { AutoRepairResult } from "../types";
import { getModelForTask } from "../../model-router";

export const AutoRepairSchema = z.object({
  code: z
    .string()
    .describe(
      "Complete, valid ES6 Remotion component code starting with imports and ending with the default/named export.",
    ),
  summary: z.string().describe("Explanation of compilation fixes applied"),
});

const SYSTEM_PROMPT = `You are an elite Creative Technologist, senior Motion Designer, and Remotion expert.
Your job is to take a draft Remotion component that has failed compilation, and produce a repaired, compile-clean version.
Fix all syntax errors, undefined imports or variables, unmatched brackets, and Remotion range/constraint violations.
Preserve all image asset URL paths, rendering logic, and custom media handling.
Output ONLY valid Remotion ES6 component code, starting with imports.`;

export async function runStage13(
  code: string,
  errors: string[],
): Promise<AutoRepairResult> {
  const promptText = `## COMPILATION ERRORS:
${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

## CURRENT CODE (WITH ERRORS):
\`\`\`tsx
${code}
\`\`\`

CRITICAL: Fix these compilation errors. Ensure all tags match, types are correct, and all variables and imports exist. Return only the corrected ES6 React/Remotion component code starting with imports.`;

  const result = await generateContent({
    model: getModelForTask("remotion_generation").id, // Auto-repair agent (resolves to gemini-3-flash)
    system: SYSTEM_PROMPT,
    prompt: promptText,
    schema: AutoRepairSchema,
    taskType: "remotion_generation",
  });

  return result.object;
}
