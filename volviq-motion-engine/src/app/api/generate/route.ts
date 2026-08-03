export const maxDuration = 300; // 5 minutes — only honored on the Node.js runtime (see below)
export const dynamic = "force-dynamic";
// NOTE: previously "edge". Edge Functions on Vercel have a hard execution
// cap well under 300s regardless of `maxDuration` above (that setting only
// applies to the Node.js runtime). This route runs a multi-stage LLM
// pipeline (storyboard -> per-scene generation -> audit -> refinement ->
// compile) that routinely needs more time than Edge allows, which is why
// the orchestrator was force-skipping its quality audit whenever
// `process.env.VERCEL` was set. Running on Node.js lets maxDuration apply
// for real and removes the need for that workaround.
export const runtime = "nodejs";

import {
  getCombinedSkillContent,
  type SkillName,
  detectSkillsLocally,
} from "@/skills";
import { checkAndIncrementUsage, requireAuth } from "@/lib/auth-server";
import { generateContent } from "@/ai/provider";
import { classifyProviderError, getErrorMessage } from "@/lib/api-errors";
import { logger } from "@/utils/logger";
import { z } from "zod";
import {
  extractComponentCode,
  validateAndRepairJSX,
} from "@/helpers/sanitize-response";
import { SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from "@/ai/prompts/generation";
import { verifyAndCompileServer } from "@/remotion/compiler-server";
import { logGenerationAnalytics, logGenerationFailure, type LogAnalyticsPayload } from "@/lib/monitoring-server";
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

  const apiKey = process.env.GEMINI_API_KEY;

  // Require a valid, logged-in user for every call to this route. Previously
  // an absent/expired bearer token silently skipped both authentication AND
  // the usage-limit check below, letting anyone who could reach this URL
  // generate for free and burn provider quota with no limit.
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user: authUser, accessToken } = auth;

  if (!apiKey) {
    logger.error("generate", "GEMINI_API_KEY missing");
    const isProd = process.env.NODE_ENV === "production";
    return new Response(
      JSON.stringify({
        error: isProd
          ? "Gemini is not configured. Set GEMINI_API_KEY in the deployment environment."
          : "Gemini is not configured. Add GEMINI_API_KEY to volviq-motion-engine/.env and restart the dev server.",
        type: "api_key_missing",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Usage limits apply to every generation call, including follow-up edits
  // and error-correction retries — those also consume model tokens and were
  // previously exempted entirely, letting anyone bypass their plan limit by
  // just chaining "follow-up" requests instead of "initial" ones.
  {
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

  const allowedCodeModels = new Set([
    "gemini-3.6-flash",
    "gemini-3.1-pro-preview",
  ]);
  const targetModelId = allowedCodeModels.has(model)
    ? model
    : "gemini-3.6-flash";

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
        targetModelId,
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
          provider: "gemini",
          model: targetModelId,
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
          provider: "gemini",
          model: targetModelId,
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
              provider: "gemini",
              model: targetModelId,
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

      // ── Compilation Safety Verification ──
      // On Edge Runtime (Vercel Hobby 30s limit), we keep this lightweight:
      // - Only run sucrase transpilation check (no new Function)
      // - Skip expensive quality audit + refinement loops for follow-up edits
      //   (user-directed edits don't need taste scoring)
      const compileValidation = verifyAndCompileServer(finalCode);

      if (!compileValidation.success) {
        console.warn(`[Pipeline] Follow-up compilation failed. Errors:`, compileValidation.errors);
        return new Response(
          JSON.stringify({
            error: `Failed to compile edit: ${compileValidation.errors.join("; ")}`,
            type: "edit_failed",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Return the result with metadata
      const responseData: GenerateResponse = {
        code: finalCode,
        summary: response.summary,
        metadata: {
          skills: detectedSkills,
          editType,
          edits: appliedEdits,
          model: targetModelId,
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
      logGenerationFailure({
        prompt,
        stage: "follow_up_edit",
        errorMessage: getErrorMessage(error),
        userId: authUser?.id,
      }).catch(() => {});
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
      targetModelId
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const generationStartedAt = Date.now();
        let streamClosed = false;
        const sendEvent = (eventObj: Record<string, unknown>) => {
          if (streamClosed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventObj)}\n\n`));
          } catch {
            // The browser may disconnect while generation is still running.
            streamClosed = true;
          }
        };
        const closeStream = () => {
          if (streamClosed) return;
          streamClosed = true;
          try {
            controller.close();
          } catch {
            // The response may already have been cancelled by the client.
          }
        };

        // Start a keep-alive heartbeat interval to prevent gateway timeouts/connection resets
        const heartbeatInterval = setInterval(() => {
          sendEvent({ type: "ping", timestamp: Date.now() });
        }, 8000); // Send ping every 8 seconds

        try {
          const finalCode = await runOrchestrator({
            prompt,
            model: targetModelId,
            userId: authUser?.id,
            images: frameImages,
            onEvent: (event) => {
              if (event.type === "telemetry") {
                // Log generation analytics asynchronously
                logGenerationAnalytics(event.data as LogAnalyticsPayload).catch((err) => {
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
          closeStream();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Streaming pipeline failed";
          const errorStack = err instanceof Error ? err.stack : undefined;
          
          // Structured error logging for production debugging
          console.error("[Pipeline:Error]", JSON.stringify({
            error: errorMessage,
            stack: errorStack,
            stage: "orchestrator_streaming",
            model: targetModelId,
            promptLength: prompt?.length,
            timestamp: new Date().toISOString(),
          }));

          // This used to only exist as a console.error line, which is lost
          // as soon as the serverless instance recycles. Persist it so
          // failed generations are actually visible in the analytics
          // dashboard, not just successful ones.
          logGenerationFailure({
            prompt,
            stage: "orchestrator_streaming",
            errorMessage,
            durationMs: generationStartedAt ? Date.now() - generationStartedAt : undefined,
            userId: authUser?.id,
          }).catch(() => {});
          
          sendEvent({ type: "error", error: errorMessage });
          closeStream();
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
      model: targetModelId,
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
