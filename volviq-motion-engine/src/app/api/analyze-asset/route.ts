import { generateContent } from "@/ai/provider";
import { requireAuth } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;
export const runtime = "nodejs";

const AssetAnalysisSchema = z.object({
  mainSubject: z.string().describe("Main subject, product name, or item identified in the asset"),
  colors: z.array(z.string()).describe("3-5 dominant hex colors or color names found in the image"),
  composition: z.string().describe("Layout and composition summary (e.g., centered product, clean background)"),
  detectedText: z.array(z.string()).describe("Any text, logos, or slogans visible in the asset"),
  visualStyle: z.string().describe("Visual aesthetic (e.g. minimalist luxury, cyber neon, clean editorial, organic)"),
  brandElements: z.array(z.string()).describe("Identified branding marks, badge shapes, or logos"),
  summary: z.string().describe("A concise 1-2 sentence description of what this asset contains and how motion graphics should highlight it"),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { url, type, filename } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing asset URL." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return a graceful fallback analysis if API key is not yet set
      return NextResponse.json({
        mainSubject: filename ? filename.replace(/\.[^/.]+$/, "") : "Uploaded Visual Subject",
        colors: ["#ffffff", "#000000", "#6366f1"],
        composition: "Clean modern layout",
        detectedText: [],
        visualStyle: "Modern Cinematic",
        brandElements: [],
        summary: `Creative asset (${filename || "visual file"}) provided as primary visual reference.`,
      });
    }

    if (type === "video") {
      return NextResponse.json({
        mainSubject: filename || "Video Asset",
        colors: ["#ffffff", "#000000"],
        composition: "Motion Sequence",
        detectedText: [],
        visualStyle: "Dynamic Video",
        brandElements: [],
        summary: `Uploaded video footage to be referenced for motion pacing and style.`,
        durationSeconds: 5,
        orientation: "portrait",
      });
    }

    // For images, analyze via Gemini Vision
    const promptText = `Analyze this uploaded image for a motion graphics & advertisement creation pipeline. Extract key visual properties, colors, subject identity, visible typography, and aesthetic style.`;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image", image: url },
        ],
      },
    ];

    const result = await generateContent({
      model: "gemini-3.6-flash",
      system: "You are an expert art director and computer vision analyst for an AI motion graphics studio. Analyze the asset accurately.",
      messages,
      schema: AssetAnalysisSchema,
      taskType: "validation",
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("[Analyze Asset API Error]:", error);
    // Graceful fallback to avoid breaking user workflow
    return NextResponse.json({
      mainSubject: "Attached Product Asset",
      colors: ["#ffffff", "#000000"],
      composition: "Subject Focus",
      detectedText: [],
      visualStyle: "High Fidelity",
      brandElements: [],
      summary: "User provided asset for high-impact creative focus.",
    });
  }
}
