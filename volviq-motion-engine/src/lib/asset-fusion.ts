import { UploadedAsset } from "@/types/assets";

/**
 * Fuses user prompt with uploaded image and video asset analyses
 * into a structured context directive for the AI orchestrator.
 */
export function fusePromptWithAssets(
  prompt: string,
  assets: UploadedAsset[] = []
): string {
  if (!assets || assets.length === 0) {
    return prompt;
  }

  const imageAssets = assets.filter((a) => a.type === "image");
  const videoAssets = assets.filter((a) => a.type === "video");

  let assetContextBlock = `\n\n## ATTACHED MULTIMODAL ASSETS & CONTEXT:\n`;
  assetContextBlock += `The user has provided ${assets.length} visual asset(s) to anchor this generation.\n`;

  if (imageAssets.length > 0) {
    assetContextBlock += `\n### IMAGE ASSETS:\n`;
    imageAssets.forEach((img, idx) => {
      assetContextBlock += `- Image ${idx + 1} (${img.filename}) [Role: ${img.role || "product asset"}]:\n`;
      if (img.analysis) {
        if (img.analysis.mainSubject) assetContextBlock += `  * Subject: ${img.analysis.mainSubject}\n`;
        if (img.analysis.colors?.length) assetContextBlock += `  * Dominant Colors: ${img.analysis.colors.join(", ")}\n`;
        if (img.analysis.visualStyle) assetContextBlock += `  * Style: ${img.analysis.visualStyle}\n`;
        if (img.analysis.detectedText?.length) assetContextBlock += `  * Visible Text/Brand: ${img.analysis.detectedText.join(", ")}\n`;
        if (img.analysis.summary) assetContextBlock += `  * Analysis: ${img.analysis.summary}\n`;
      }
      assetContextBlock += `  * Direct Asset URL: ${img.url.startsWith("data:") ? "[Embedded Base64 Asset]" : img.url}\n`;
    });
  }

  if (videoAssets.length > 0) {
    assetContextBlock += `\n### VIDEO ASSETS:\n`;
    videoAssets.forEach((vid, idx) => {
      assetContextBlock += `- Video ${idx + 1} (${vid.filename}) [Role: ${vid.role || "reference footage"}]:\n`;
      if (vid.analysis) {
        if (vid.analysis.durationSeconds) assetContextBlock += `  * Duration: ~${vid.analysis.durationSeconds}s\n`;
        if (vid.analysis.orientation) assetContextBlock += `  * Orientation: ${vid.analysis.orientation}\n`;
        if (vid.analysis.summary) assetContextBlock += `  * Context/Content: ${vid.analysis.summary}\n`;
      }
      assetContextBlock += `  * Direct Asset URL: ${vid.url.startsWith("data:") ? "[Embedded Base64 Video]" : vid.url}\n`;
    });
  }

  assetContextBlock += `\n### CREATIVE FUSION DIRECTIVE:
1. Treat uploaded product assets as the exact primary subject — do not invent an unrelated product when one is provided.
2. In the resulting animation, reference the asset URLs directly in <img> or <Img> Remotion components where appropriate.
3. Match the visual color palette, typography energy, and pacing with the uploaded brand elements and style cues.
`;

  return `${prompt}${assetContextBlock}`;
}
