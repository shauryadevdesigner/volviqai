export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

import {
  getCombinedSkillContent,
  type SkillName,
  detectSkillsLocally,
} from "@/skills";
import { checkAndIncrementUsage, getUserFromRequest } from "@/lib/auth-server";
import { getQevaroApiKey } from "@/ai/qevaro";
import { generateContent } from "@/ai/provider";
import { getModelForTask } from "@/ai/model-router";
import { classifyProviderError, getErrorMessage } from "@/lib/api-errors";
import { logger } from "@/utils/logger";
import { z } from "zod";
import {
  stripMarkdownFences,
  extractComponentCode,
  validateAndRepairJSX,
} from "@/helpers/sanitize-response";
import fs from "fs";
import path from "path";
import { SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from "@/ai/prompts/generation";
import { verifyAndCompileServer } from "@/remotion/compiler-server";
import { logGenerationAnalytics } from "@/lib/monitoring-server";
import { runOrchestrator } from "@/ai/orchestrator";
import { generateAsset } from "@/ai/image-generator";

// Schema for follow-up edit responses
// Note: Using a flat object schema for structured follow-up edits
const FollowUpResponseSchema = z.object({
  type: z
    .enum(["edit", "full"])
    .describe(
      'Use "edit" for small targeted changes, "full" for major restructuring',
    ),
  summary: z
    .string()
    .describe(
      "A brief 1-sentence summary of what changes were made, e.g. 'Changed background color to blue and increased font size'",
    ),
  edits: z
    .array(
      z.object({
        description: z
          .string()
          .describe(
            "Brief description of this edit, e.g. 'Update background color', 'Increase animation duration'",
          ),
        old_string: z
          .string()
          .describe("The exact string to find (must match exactly)"),
        new_string: z.string().describe("The replacement string"),
      }),
    )
    .optional()
    .describe(
      "Required when type is 'edit': array of search-replace operations",
    ),
  code: z
    .string()
    .optional()
    .describe(
      "Required when type is 'full': the complete replacement code starting with imports",
    ),
});

type EditOperation = {
  description: string;
  old_string: string;
  new_string: string;
  lineNumber?: number;
};

// Calculate line number where a string occurs in code
function getLineNumber(code: string, searchString: string): number {
  const index = code.indexOf(searchString);
  if (index === -1) return -1;
  return code.substring(0, index).split("\n").length;
}

// Apply edit operations to code and enrich with line numbers
function applyEdits(
  code: string,
  edits: EditOperation[],
): {
  success: boolean;
  result: string;
  error?: string;
  enrichedEdits?: EditOperation[];
  failedEdit?: EditOperation;
} {
  let result = code;
  const enrichedEdits: EditOperation[] = [];

  for (let i = 0; i < edits.length; i++) {
    const edit = edits[i];
    const { old_string, new_string, description } = edit;

    // Check if the old_string exists (exact match)
    if (!result.includes(old_string)) {
      // Fuzzy fallback: try trimmed whitespace match
      const trimmedOld = old_string.trim();
      const lines = result.split("\n");
      let fuzzyMatchIndex = -1;
      let fuzzyMatchLength = 0;

      // Search for trimmed content line-by-line
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        if (lines[lineIdx].trim() === trimmedOld) {
          fuzzyMatchIndex = lineIdx;
          fuzzyMatchLength = 1;
          break;
        }
        // Multi-line fuzzy: try matching consecutive trimmed lines
        const oldLines = trimmedOld.split("\n").map(l => l.trim());
        if (lines[lineIdx].trim() === oldLines[0]) {
          let match = true;
          for (let k = 1; k < oldLines.length && lineIdx + k < lines.length; k++) {
            if (lines[lineIdx + k].trim() !== oldLines[k]) {
              match = false;
              break;
            }
          }
          if (match && oldLines.length > 0) {
            fuzzyMatchIndex = lineIdx;
            fuzzyMatchLength = oldLines.length;
            break;
          }
        }
      }

      if (fuzzyMatchIndex >= 0) {
        // Replace the fuzzy-matched lines with new_string
        const before = lines.slice(0, fuzzyMatchIndex);
        const after = lines.slice(fuzzyMatchIndex + fuzzyMatchLength);
        result = [...before, new_string, ...after].join("\n");
        
        enrichedEdits.push({
          description,
          old_string,
          new_string,
          lineNumber: fuzzyMatchIndex + 1,
        });
        continue; // Skip to next edit
      }

      return {
        success: false,
        result: code,
        error: `Edit ${i + 1} failed: Could not find the specified text`,
        failedEdit: edit,
      };
    }

    // Check for multiple matches (ambiguous)
    const matches = result.split(old_string).length - 1;
    if (matches > 1) {
      return {
        success: false,
        result: code,
        error: `Edit ${i + 1} failed: Found ${matches} matches. The edit target is ambiguous.`,
        failedEdit: edit,
      };
    }

    // Get line number before applying edit
    const lineNumber = getLineNumber(result, old_string);

    // Apply the edit
    result = result.replace(old_string, new_string);

    // Store enriched edit with line number
    enrichedEdits.push({
      description,
      old_string,
      new_string,
      lineNumber,
    });
  }

  return { success: true, result, enrichedEdits };
}

interface ConversationContextMessage {
  role: "user" | "assistant";
  content: string;
  /** For user messages, attached images as base64 data URLs */
  attachedImages?: string[];
}

interface ErrorCorrectionContext {
  error: string;
  attemptNumber: number;
  maxAttempts: number;
  failedEdit?: {
    description: string;
    old_string: string;
    new_string: string;
  };
}

interface GenerateRequest {
  prompt: string;
  model?: string;
  currentCode?: string;
  conversationHistory?: ConversationContextMessage[];
  isFollowUp?: boolean;
  hasManualEdits?: boolean;
  /** Error correction context for self-healing loops */
  errorCorrection?: ErrorCorrectionContext;
  /** Skills already used in this conversation (to avoid redundant skill content) */
  previouslyUsedSkills?: string[];
  /** Base64 image data URLs for visual context */
  frameImages?: string[];
}

interface GenerateResponse {
  code: string;
  summary: string;
  metadata: {
    skills: string[];
    editType: "tool_edit" | "full_replacement";
    edits?: EditOperation[];
    model: string;
  };
}

const CREATIVE_MEMORY_FILE = path.join(process.cwd(), "src/data/creative-memory.json");

interface CreativeMemoryEntry {
  prompt: string;
  audience: string;
  emotion: string;
  template?: string;
  colorPalette?: string;
  storyboard: unknown[];
  finalScore: number;
  timestamp: string;
}

function readCreativeMemory(): CreativeMemoryEntry[] {
  try {
    if (fs.existsSync(CREATIVE_MEMORY_FILE)) {
      const data = fs.readFileSync(CREATIVE_MEMORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read creative memory:", error);
  }
  return [];
}

function saveToCreativeMemory(entry: CreativeMemoryEntry) {
  try {
    const memory = readCreativeMemory();
    memory.push(entry);
    // Limit cache size to last 50 successful creations
    if (memory.length > 50) {
      memory.shift();
    }
    const dir = path.dirname(CREATIVE_MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CREATIVE_MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
    console.log("Saved successful generation to creative memory database.");
  } catch (error) {
    console.error("Failed to save to creative memory:", error);
  }
}




const PremiumAuditSchema = z.object({
  taste: z.object({
    visual_taste: z.number().min(0).max(100),
    motion_taste: z.number().min(0).max(100),
    cinematic_quality: z.number().min(0).max(100),
    emotional_impact: z.number().min(0).max(100),
    brand_presence: z.number().min(0).max(100),
    premium_feel: z.number().min(0).max(100),
    originality: z.number().min(0).max(100),
    averageScore: z.number().min(0).max(100),
  }),
  conversion: z.object({
    retention_score: z.number().min(0).max(100),
    emotional_score: z.number().min(0).max(100),
    conversion_score: z.number().min(0).max(100),
    memorability_score: z.number().min(0).max(100),
    averageScore: z.number().min(0).max(100),
  }),
  passed: z.boolean().describe("True if both taste averageScore and conversion averageScore are >= 80"),
  critique: z.array(z.string()).describe("Detailed flaws that must be fixed to reach 90+ score. Limit to top 3 issues."),
});

type PremiumAudit = z.infer<typeof PremiumAuditSchema>;

const QUALITY_AUDIT_SYSTEM_PROMPT = `You are a world-class AI Creative Director, Conversion Specialist, and Motion critic.
You inspect generated Remotion React code against two separate criteria:
1. Design Taste (visual style, typography hierarchy, spring timing, active backgrounds, composition)
2. Conversion & Psychology (hook strength, retention pacing, clear brand recall, emotional resonance, conversion CTA)

DIMENSIONS OF AUDIT:
- Visual Assets & Composition:
  * Check image/asset integration. Visual assets (images/SVGs) must be styled and positioned beautifully according to layout composition rules.
  * Adaptive Layout: Verify text layout doesn't overlap important visual parts of the asset. Typography and imagery must complement each other.
  * Motion Relevance: Ensure every image moves (e.g. Ken Burns effect, floating, slow drift, scale reveals). REJECT static assets.
  * Visual Hierarchy & Placement: Ensure clear visual hierarchy. Avoid generic imagery, empty layouts, and poor text placement.
- Overlapping layers: ALL stacked text divs MUST be grouped inside a single flex-column with a gap. Never overlap independent absolute layers.
- Active Backgrounds: Vignettes, radial gradients, slow-drifting soft glowing radial shapes.
- Lighting: THREE lights (spotlight, ambient, standard material) if 3D, ambient box shadows if 2D.
- Output Range safety: interpolate() outputs must be numeric ranges (never strings or colors).
- Easing curve: no linear entrance timing. Use spring or smooth curves.

To pass, both Taste averageScore and Conversion averageScore must be >= 80. Else, provide constructive fixes.`;

async function evaluateCodeQuality(code: string, userPrompt: string): Promise<PremiumAudit> {
  const result = await generateContent({
    provider: "qevaro",
    model: getModelForTask("quality_assurance").id,
    system: QUALITY_AUDIT_SYSTEM_PROMPT,
    prompt: `Audit the following generated Remotion React code for the user prompt: "${userPrompt}"\n\n\`\`\`tsx\n${code}\n\`\`\``,
    schema: PremiumAuditSchema,
    taskType: "quality_assurance",
  });
  return result.object;
}

const REFINEMENT_SYSTEM_PROMPT = `You are an elite Creative Technologist, senior Motion Designer, and Remotion expert.
Your job is to take a draft Remotion component that has been critique-flagged for visual, design-taste, or conversion issues, and produce a refined, polished version that meets premium studio standards.

CRITICAL RULES:
- Fix all issues listed by the Art Critic.
- Check layout overlapping: wrap stacked texts in a single flex-column container with centered alignment.
- Ensure all coordinate properties (translate, opacity) animate via spring or smooth interpolation.
- Background MUST have slow-moving soft glowing gradients or blurred drifting circles.
- Keep all safety rules: outputRange in interpolate must contain ONLY numbers, clamp extrapolation.
- Ensure any visual assets (images/SVGs) are integrated correctly, styled beautifully, and have dynamic motion (no static images).
- Preserve all image asset URL paths, rendering logic, and custom media handling.
- Output ONLY valid, compiled Remotion component code, starting with imports. No markdown wrappers.`;

async function processPlaceholderImages(code: string): Promise<string> {
  const regex = /_IMAGE_GEN_\["([^"]+)"\]_/g;
  let newCode = code;
  let match;
  
  const matches: Array<{ placeholder: string; prompt: string }> = [];
  while ((match = regex.exec(code)) !== null) {
    matches.push({ placeholder: match[0], prompt: match[1] });
  }

  for (const item of matches) {
    try {
      console.log(`[Placeholder Image] Generating asset for prompt: "${item.prompt}"`);
      const url = await generateAsset(item.prompt, "Luxury");
      newCode = newCode.replaceAll(item.placeholder, url);
    } catch (err) {
      console.error(`[Placeholder Image Error] Failed to generate asset:`, err);
      newCode = newCode.replaceAll(item.placeholder, "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800");
    }
  }

  return newCode;
}

export async function POST(req: Request) {
  const {
    prompt,
    model = "deepseek-v4-flash",
    currentCode,
    conversationHistory = [],
    isFollowUp = false,
    hasManualEdits = false,
    errorCorrection,
    previouslyUsedSkills = [],
    frameImages,
  }: GenerateRequest = await req.json();

  const apiKey = getQevaroApiKey();

  const authUser = await getUserFromRequest(req);
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!isFollowUp && !errorCorrection && authUser && accessToken) {
    const usage = await checkAndIncrementUsage(authUser.id, accessToken);
    if (!usage.ok && usage.error === "limit_reached") {
      return new Response(
        JSON.stringify({
          error: `Monthly generation limit reached (${usage.used}/${usage.limit}). Upgrade your plan for more.`,
          type: "limit",
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (!apiKey) {
    logger.error("generate", "QEVARO_API_KEY missing");
    const isProd = process.env.NODE_ENV === "production";
    return new Response(
      JSON.stringify({
        error: isProd
          ? "Qevaro is not configured. Please ensure QEVARO_API_KEY is configured in your Vercel environment variables."
          : "Qevaro is not configured. Add QEVARO_API_KEY to volviq-motion-engine/.env and restart the dev server.",
        type: "api_key_missing",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const qevaroModelId = model;

  // ── LOCAL SKILL DETECTION & VALIDATION BYPASS ──
  let detectedSkills: SkillName[] = [];
  detectedSkills = detectSkillsLocally(prompt);
  console.log("Detected skills locally:", detectedSkills);

  // Filter out skills that were already used in the conversation to avoid redundant context
  const newSkills = detectedSkills.filter(
    (skill) => !previouslyUsedSkills.includes(skill),
  );
  if (
    previouslyUsedSkills.length > 0 &&
    newSkills.length < detectedSkills.length
  ) {
    console.log(
      `Skipping ${detectedSkills.length - newSkills.length} previously used skills:`,
      detectedSkills.filter((s) => previouslyUsedSkills.includes(s)),
    );
  }

  // Load skill-specific content only for NEW skills (previously used skills are already in context)
  const skillContent = getCombinedSkillContent(newSkills as SkillName[]);
  const enhancedSystemPrompt = skillContent
    ? `${SYSTEM_PROMPT}\n\n## SKILL-SPECIFIC GUIDANCE\n${skillContent}`
    : SYSTEM_PROMPT;

  if (isFollowUp && currentCode) {
    try {
      // Build context for the edit request
      const contextMessages = conversationHistory.slice(-6);
      let conversationContext = "";
      if (contextMessages.length > 0) {
        conversationContext =
          "\n\n## RECENT CONVERSATION:\n" +
          contextMessages
            .map((m) => {
              const imageNote =
                m.attachedImages && m.attachedImages.length > 0
                  ? ` [with ${m.attachedImages.length} attached image${m.attachedImages.length > 1 ? "s" : ""}]`
                  : "";
              return `${m.role.toUpperCase()}: ${m.content}${imageNote}`;
            })
            .join("\n");
      }

      const manualEditNotice = hasManualEdits
        ? "\n\nNOTE: The user has made manual edits to the code. Preserve these changes."
        : "";

      // Error correction context for self-healing
      let errorCorrectionNotice = "";
      if (errorCorrection) {
        const failedEditInfo = errorCorrection.failedEdit
          ? `

The previous edit attempt failed. Here's what was tried:
- Description: ${errorCorrection.failedEdit.description}
- Tried to find: \`${errorCorrection.failedEdit.old_string}\`
- Wanted to replace with: \`${errorCorrection.failedEdit.new_string}\`

The old_string was either not found or matched multiple locations. You MUST include more surrounding context to make the match unique.`
          : "";

        const isEditFailure =
          errorCorrection.error.includes("Edit") &&
          errorCorrection.error.includes("failed");

        if (isEditFailure) {
          errorCorrectionNotice = `

## EDIT FAILED (ATTEMPT ${errorCorrection.attemptNumber}/${errorCorrection.maxAttempts})
${errorCorrection.error}
${failedEditInfo}

CRITICAL: Your previous edit target was ambiguous or not found. To fix this:
1. Include MORE surrounding code context in old_string to make it unique
2. Make sure old_string matches the code EXACTLY (including whitespace)
3. If the code structure changed, look at the current code carefully`;
        } else {
          errorCorrectionNotice = `

## COMPILATION ERROR (ATTEMPT ${errorCorrection.attemptNumber}/${errorCorrection.maxAttempts})
The previous code failed to compile with this error:
\`\`\`
${errorCorrection.error}
\`\`\`

CRITICAL: Fix this compilation error. Common issues include:
- Syntax errors (missing brackets, semicolons)
- Invalid JSX (unclosed tags, invalid attributes)
- Undefined variables or imports
- TypeScript type errors

Focus ONLY on fixing the error. Do not make other changes.`;
        }
      }

      const editPromptText = `## CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`
${conversationContext}
${manualEditNotice}
${errorCorrectionNotice}

## USER REQUEST:
${prompt}
${frameImages && frameImages.length > 0 ? `\n(See the attached ${frameImages.length === 1 ? "image" : "images"} for visual reference)` : ""}

Analyze the request and decide: use targeted edits (type: "edit") for small changes, or full replacement (type: "full") for major restructuring.`;

      console.log(
        "Follow-up edit with prompt:",
        prompt,
        "model:",
        qevaroModelId,
        "skills:",
        detectedSkills.length > 0 ? detectedSkills.join(", ") : "general",
        frameImages && frameImages.length > 0
          ? `(with ${frameImages.length} image(s))`
          : "",
      );

      // Build messages array - include images if provided
      const editMessageContent: Array<
        { type: "text"; text: string } | { type: "image"; image: string }
      > = [{ type: "text" as const, text: editPromptText }];
      if (frameImages && frameImages.length > 0) {
        for (const img of frameImages) {
          editMessageContent.push({ type: "image" as const, image: img });
        }
      }
      const editMessages: Array<{
        role: "user";
        content: Array<
          { type: "text"; text: string } | { type: "image"; image: string }
        >;
      }> = [
        {
          role: "user" as const,
          content: editMessageContent,
        },
      ];

      let response;
      try {
        const editResult = await generateContent({
          provider: "qevaro",
          model: getModelForTask("remotion_generation").id,
          system: `${enhancedSystemPrompt}\n\n---\n\n${FOLLOW_UP_SYSTEM_PROMPT}`,
          messages: editMessages,
          schema: FollowUpResponseSchema,
          taskType: "remotion_generation",
        });
        response = editResult.object;

        if (!response || !response.type) {
          throw new Error("Invalid AI response: 'type' is missing.");
        }
        if (response.type === "edit" && (!response.edits || response.edits.length === 0)) {
          throw new Error("Invalid AI response: 'type' is 'edit' but 'edits' array is missing or empty.");
        }
        if (response.type === "full" && !response.code) {
          throw new Error("Invalid AI response: 'type' is 'full' but 'code' is missing.");
        }
      } catch (schemaError) {
        console.warn("Structured follow-up edit failed, falling back to simple full code generation:", schemaError);
        
        const fallbackSystemPrompt = `${enhancedSystemPrompt}
        
You are Volviq. The user wants to modify the existing component.
Analyze the user's request and the current code, and output the COMPLETE, updated React/Remotion component code.
You MUST output the complete code in the 'code' property of the JSON response.`;

        const fallbackResult = await generateContent({
          provider: "qevaro",
          model: getModelForTask("remotion_generation").id,
          system: fallbackSystemPrompt,
          messages: editMessages,
          schema: z.object({
            code: z.string().describe("The complete, updated React/Remotion component code starting with imports.")
          }),
          taskType: "remotion_generation",
        });
        
        response = {
          type: "full" as const,
          summary: "Refined component layout and visual styles based on your edit request.",
          code: fallbackResult.object.code,
        };
      }
      let finalCode: string;
      let editType: "tool_edit" | "full_replacement";
      let appliedEdits: EditOperation[] | undefined;

      if (response.type === "edit" && response.edits) {
        // Apply the edits to the current code
        const result = applyEdits(currentCode, response.edits);
        if (!result.success) {
          console.warn(`[Pipeline Fallback] Targeted edit failed: ${result.error}. Falling back to full code generation.`);
          try {
            const fallbackSystemPrompt = `${enhancedSystemPrompt}
        
You are Volviq. The user wants to modify the existing component.
Analyze the user's request, the current code, and the failed edit error.
Output the COMPLETE, updated React/Remotion component code starting with imports.
You MUST output the complete code in the 'code' property of the JSON response.`;

            const fallbackPromptText = `## CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`

## USER REQUEST:
${prompt}

## FAILED TARGETED EDIT ERROR:
${result.error}

Since the search-replace edit failed, please output the COMPLETE updated code instead.`;

            const fallbackResult = await generateContent({
              provider: "qevaro",
              model: qevaroModelId,
              system: fallbackSystemPrompt,
              prompt: fallbackPromptText,
              schema: z.object({
                code: z.string().describe("The complete, updated React/Remotion component code starting with imports.")
              }),
              taskType: "remotion_generation",
            });
            
            finalCode = extractComponentCode(fallbackResult.object.code);
            editType = "full_replacement";
            appliedEdits = undefined;
            console.log("[Pipeline Fallback] Full code replacement fallback succeeded.");
          } catch (fallbackError) {
            console.error("[Pipeline Fallback Critical] Fallback full code generation failed:", fallbackError);
            return new Response(
              JSON.stringify({
                error: `Edit failed: ${result.error}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
                type: "edit_failed",
                failedEdit: result.failedEdit,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
        } else {
          finalCode = extractComponentCode(result.result);
          editType = "tool_edit";
          // Use enriched edits with line numbers
          appliedEdits = result.enrichedEdits;
          console.log(`Applied ${response.edits.length} edit(s) successfully`);
        }
      } else if (response.type === "full" && response.code) {
        // Full replacement
        finalCode = response.code;
        editType = "full_replacement";
        console.log("Using full code replacement");
      } else {
        // Invalid response - missing required fields
        return new Response(
          JSON.stringify({
            error: "Invalid AI response: missing required fields",
            type: "edit_failed",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Process any placeholder image generation requests embedded in the edited code
      finalCode = await processPlaceholderImages(finalCode);

      // ── JSX Validation & Auto-Repair for follow-up edits ──────────
      // Validate the generated code before quality evaluation
      const followUpValidation = validateAndRepairJSX(finalCode);
      if (!followUpValidation.isValid && followUpValidation.repairs.length > 0) {
        console.log(`[Pipeline] Follow-up JSX repairs: ${followUpValidation.repairs.join("; ")}`);
        finalCode = followUpValidation.code;
      }

      // ── Compilation Safety Verification & Auto-Repair ──
      let compileValidation = verifyAndCompileServer(finalCode);
      let compileAttempts = 0;
      const maxCompileAttempts = errorCorrection ? 2 : 3;
      
      while (!compileValidation.success && compileAttempts < maxCompileAttempts) {
        compileAttempts++;
        console.log(`[Pipeline] Follow-up compilation failed, attempt ${compileAttempts}/${maxCompileAttempts}. Errors:`, compileValidation.errors);
        
        const repairResult = await generateContent({
          provider: "qevaro",
          model: getModelForTask("remotion_generation").id,
          system: REFINEMENT_SYSTEM_PROMPT,
          prompt: `## COMPILATION ERROR (ATTEMPT ${compileAttempts}/${maxCompileAttempts})
The edited component code failed to compile with the following errors:
${compileValidation.errors.map((e: string, i: number) => `${i + 1}. ${e}`).join("\n")}

## CURRENT CODE (WITH ERRORS):
\`\`\`tsx
${finalCode}
\`\`\`

CRITICAL: Fix these compilation errors. Ensure all tags match, types are correct, and all variables and imports exist. Return only the corrected ES6 React/Remotion component code starting with imports.`,
          schema: z.object({
            code: z.string().describe("Complete, valid ES6 Remotion component code starting with imports and ending with the default/named export."),
            summary: z.string().describe("Explanation of compilation fixes"),
          }),
          taskType: "remotion_generation",
        });
        
        finalCode = extractComponentCode(stripMarkdownFences(repairResult.object.code));
        compileValidation = verifyAndCompileServer(finalCode);
      }

      if (!compileValidation.success) {
        return new Response(
          JSON.stringify({
            error: `Failed to compile edit: ${compileValidation.errors.join("; ")}`,
            type: "edit_failed",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Evaluate visual taste and conversion quality of follow-up edit
      // Skip visual taste & conversion refinement for error-correction/self-healing runs to prevent timeouts and latency
      const shouldSkipRefinement = Boolean(errorCorrection);
      let evaluation = shouldSkipRefinement 
        ? { passed: true, taste: { averageScore: 100 }, conversion: { averageScore: 100 }, critique: [] }
        : await evaluateCodeQuality(finalCode, prompt);
      let refinementAttempt = 0;
      const maxRefinementAttempts = 2;

      while (!evaluation.passed && refinementAttempt < maxRefinementAttempts) {
        refinementAttempt++;
        console.log(
          `Refining follow-up edit, attempt ${refinementAttempt}. Taste Score: ${evaluation.taste.averageScore}/100, Conversion Score: ${evaluation.conversion.averageScore}/100`
        );

        const refinedResult = await generateContent({
          provider: "qevaro",
          model: getModelForTask("remotion_generation").id,
          system: REFINEMENT_SYSTEM_PROMPT,
          prompt: `## USER REQUEST (EDIT):
${prompt}

## PREVIOUS CODE DRAFT (FAILED CRITIQUE):
\`\`\`tsx
${finalCode}
\`\`\`

## ART CRITIC DETECTED ISSUES TO FIX:
${evaluation.critique.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Please fix these issues, improve layout safety and motion visual quality to meet premium standards, and output the refined code.`,
          schema: z.object({
            code: z.string().describe("Complete, valid ES6 Remotion component code starting with imports and ending with closing export block."),
            summary: z.string().describe("Brief description of refinement changes"),
          }),
          taskType: "remotion_generation",
        });

        finalCode = extractComponentCode(stripMarkdownFences(refinedResult.object.code));
        editType = "full_replacement"; // Force full replacement since we refined it
        appliedEdits = undefined;

        evaluation = await evaluateCodeQuality(finalCode, prompt);
      }

      // Save successful follow-up edits to Creative Memory database
      const finalTasteScore = evaluation.taste.averageScore;
      const finalConvScore = evaluation.conversion.averageScore;
      const finalScore = Math.round((finalTasteScore + finalConvScore) / 2);

      if (finalScore >= 90) {
        const parsedBrief = (() => {
          const audienceMatch = finalCode.match(/\*\s*AUDIENCE\s*:\s*([^\n]+)/i);
          const emotionMatch = finalCode.match(/\*\s*EMOTION\s*:\s*([^\n(]+)/i);
          return {
            audience: audienceMatch ? audienceMatch[1].trim() : "Existing Audience",
            emotion: emotionMatch ? emotionMatch[1].trim() : "Luxury",
          };
        })();

        saveToCreativeMemory({
          prompt,
          audience: parsedBrief.audience,
          emotion: parsedBrief.emotion,
          storyboard: [],
          finalScore,
          timestamp: new Date().toISOString(),
        });
      }

      // Return the result with metadata
      const responseData: GenerateResponse = {
        code: finalCode,
        summary: response.summary,
        metadata: {
          skills: detectedSkills,
          editType,
          edits: appliedEdits,
          model: qevaroModelId,
        },
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const classified = classifyProviderError(error);
      logger.error("generate", "Follow-up edit failed", {
        message: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return new Response(
        JSON.stringify({
          error: classified.message,
          type: classified.type,
          detail:
            process.env.NODE_ENV === "development"
              ? getErrorMessage(error)
              : undefined,
        }),
        { status: classified.status, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // INITIAL GENERATION: Use streaming for new animations
  try {
    console.log(
      "Starting 16-Stage Universal Creative Brain V1 Orchestrator with prompt:",
      prompt,
      "model:",
      qevaroModelId
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventObj: Record<string, unknown>) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventObj)}\n\n`));
          } catch (e) {
            // Stream may already be closed
          }
        };

        // Start a keep-alive heartbeat interval to prevent gateway timeouts/connection resets
        const heartbeatInterval = setInterval(() => {
          sendEvent({ type: "ping", timestamp: Date.now() });
        }, 8000); // Send ping every 8 seconds

        try {
          const finalCode = await runOrchestrator({
            prompt,
            model: qevaroModelId,
            userId: authUser?.id,
            onEvent: (event) => {
              if (event.type === "telemetry") {
                // Log generation analytics asynchronously
                logGenerationAnalytics(event.data).catch((err) => {
                  console.error("Failed to log generation analytics:", err);
                });
              } else {
                sendEvent(event);
              }
            }
          });

          // Stream final approved code chunk-by-chunk to client
          sendEvent({ type: "text-start" });
          const chunkSize = 250;
          for (let offset = 0; offset < finalCode.length; offset += chunkSize) {
            const chunk = finalCode.slice(offset, offset + chunkSize);
            sendEvent({ type: "text-delta", delta: chunk });
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          // Complete streaming pipeline
          sendEvent({ type: "reasoning-start", phase: "idle" });
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Streaming pipeline failed";
          console.error("Orchestrator streaming error:", err);
          sendEvent({ type: "error", error: errorMessage });
          controller.close();
        } finally {
          clearInterval(heartbeatInterval);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const classified = classifyProviderError(error);
    logger.error("generate", "Stream generation failed", {
      message: getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      model: qevaroModelId,
    });
    return new Response(
      JSON.stringify({
        error: classified.message,
        type: classified.type,
        detail:
          process.env.NODE_ENV === "development"
            ? getErrorMessage(error)
            : undefined,
      }),
      { status: classified.status, headers: { "Content-Type": "application/json" } },
    );
  }
}
