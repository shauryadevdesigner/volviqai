import { generateAsset } from "../../image-generator";
import { AssetPlan, GeneratedAssets } from "../types";

export async function runStage6(
  assetPlan: AssetPlan,
  onProgress?: (msg: string) => void,
): Promise<GeneratedAssets> {
  const sceneAssets: Record<
    number,
    { imageUrl: string; isFallbackSvg: boolean }
  > = {};

  for (const scene of assetPlan.scenes) {
    if (scene.requiresAssets && scene.prompt) {
      if (onProgress) {
        onProgress(
          `Generating asset for Scene ${scene.sceneNumber}: ${scene.prompt.substring(0, 30)}...`,
        );
      }
      try {
        // Map assetType to design-system compatible style string
        let style = "SaaS";
        if (
          scene.assetType === "product_render" ||
          scene.assetType === "luxury_photo"
        ) {
          style = "Luxury";
        } else if (scene.assetType === "device_mockup") {
          style = "Tech";
        }

        const url = await generateAsset(scene.prompt, style);
        const isSvg = url.endsWith(".svg");
        sceneAssets[scene.sceneNumber] = {
          imageUrl: url,
          isFallbackSvg: isSvg,
        };
      } catch (error) {
        console.error(
          `Stage 6 failed to generate asset for Scene ${scene.sceneNumber}:`,
          error,
        );
        sceneAssets[scene.sceneNumber] = {
          imageUrl: "/cyberpunk.jpg", // fallback
          isFallbackSvg: false,
        };
      }
    }
  }

  return { sceneAssets };
}
