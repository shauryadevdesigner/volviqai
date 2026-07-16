export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

import { RenderRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import { clampDurationInFrames } from "@/lib/video-duration";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    const inputProps = {
      ...body.inputProps,
      durationInFrames: clampDurationInFrames(body.inputProps.durationInFrames),
    };

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    // Base64 encode the code to pass it in the URL
    // We use btoa but handle unicode characters safely
    const base64Code = btoa(unescape(encodeURIComponent(inputProps.code)));
    const durationSec = Math.ceil(inputProps.durationInFrames / (inputProps.fps || 30));

    const renderTargetUrl = `${baseUrl}/render-target?durationInFrames=${inputProps.durationInFrames}&code=${encodeURIComponent(base64Code)}`;

    // JSON2VIDEO requires scenes array with explicit element dimensions
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
              html: `<iframe src="${renderTargetUrl}" style="width:1080px;height:1920px;border:none;overflow:hidden;" scrolling="no"></iframe>`,
              width: 1080,
              height: 1920,
              x: 0,
              y: 0,
              duration: durationSec
            }
          ]
        }
      ]
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
      throw new Error("Failed to start JSON2VIDEO render: " + JSON.stringify(data));
    }

    // Return the JSON2VIDEO project ID as the renderId
    return {
      renderId: data.project,
      bucketName: "json2video", // Mock bucket name to satisfy types
    } as unknown as RenderMediaOnLambdaOutput;
  }
);
