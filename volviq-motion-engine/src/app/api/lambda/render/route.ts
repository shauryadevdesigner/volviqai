export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

import { RenderRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import { clampDurationInFrames } from "@/lib/video-duration";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { generateContent } from "@/ai/provider";
import { getModelForTask } from "@/ai/model-router";

const REMOTION_TO_HTML_PROMPT = `You are an expert CSS animator. Convert the given Remotion React component into a SINGLE self-contained HTML page with CSS keyframe animations.

RULES:
- Output ONLY the HTML content (no markdown, no backticks, no explanation).
- The root container MUST be exactly the specified width x height pixels.
- Use CSS @keyframes for ALL animations (fade-in, slide, scale, glow, etc.).
- Use inline <style> tags for all CSS.
- Use modern CSS: gradients, transforms, opacity, filters, backdrop-filter.
- Replicate the visual style as closely as possible: colors, fonts (use Google Fonts via @import), layout, spacing, shadows.
- Animations should auto-play using animation-fill-mode: forwards and appropriate delays to sequence elements.
- The total animation duration should match the specified duration in seconds.
- Do NOT use JavaScript. Pure HTML + CSS only.
- Make it visually stunning: use gradients, glow effects, smooth transitions.
- Background should have animated gradients or subtle motion via CSS.
- Text should animate in with smooth reveals (fadeIn, slideUp, etc.).
- Keep the same content/copy from the Remotion component.`;

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    const inputProps = {
      ...body.inputProps,
      durationInFrames: clampDurationInFrames(body.inputProps.durationInFrames),
    };

    const durationSec = Math.ceil(inputProps.durationInFrames / (inputProps.fps || 30));

    // Convert Remotion React code → pure HTML/CSS animation via AI
    const conversionModel = getModelForTask("remotion_generation");
    const conversionResult = await generateContent({
      model: conversionModel.id,
      stream: true,
      system: REMOTION_TO_HTML_PROMPT,
      prompt: `Convert this Remotion component to a self-contained HTML page.
Width: 1080px, Height: 1920px, Total animation duration: ${durationSec} seconds.

Remotion Code:
${inputProps.code}`,
      taskType: "remotion_generation",
    });

    // Collect the full streamed text
    let htmlContent = "";
    for await (const chunk of conversionResult.textStream) {
      htmlContent += chunk;
    }

    // Strip any markdown fences the model might add
    htmlContent = htmlContent
      .replace(/^```html?\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    // Ensure the HTML is not empty
    if (!htmlContent || htmlContent.length < 50) {
      throw new Error("AI failed to convert Remotion code to HTML/CSS");
    }

    // Build JSON2VIDEO payload with inline HTML
    const json2VideoPayload = {
      resolution: "custom",
      width: 1080,
      height: 1920,
      quality: "high",
      scenes: [
        {
          "background-color": "#000000",
          duration: durationSec,
          elements: [
            {
              type: "html",
              html: htmlContent,
              width: 1080,
              height: 1920,
              x: 0,
              y: 0,
              duration: durationSec,
            },
          ],
        },
      ],
    };

    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": process.env.JSON2VIDEO_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json2VideoPayload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("JSON2VIDEO Error:", text);
      throw new Error(`JSON2VIDEO API Error: ${response.status} ${text}`);
    }

    const data = await response.json();

    if (!data.success || !data.project) {
      throw new Error(
        "Failed to start JSON2VIDEO render: " + JSON.stringify(data)
      );
    }

    // Return the JSON2VIDEO project ID as the renderId
    return {
      renderId: data.project,
      bucketName: "json2video",
    } as unknown as RenderMediaOnLambdaOutput;
  }
);
