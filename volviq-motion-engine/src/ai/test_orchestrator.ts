import dotenv from "dotenv";
dotenv.config();

import { runConsolidatedBrief } from "./orchestrator/stages/stage1-creative";
import { runStage4 } from "./orchestrator/stages/stage4-design";

async function main() {
  const prompt = "Create a premium luxury reveal ad for a wristwatch";
  try {
    console.log("1. Running Consolidated Briefing Stage...");
    const consolidatedBrief = await runConsolidatedBrief(prompt);
    console.log("Consolidated Brief Success:", JSON.stringify(consolidatedBrief, null, 2));

    console.log("\n2. Reconstructing Storyboard Brief...");
    const brief = {
      template: consolidatedBrief.template,
      colorPalette: consolidatedBrief.colorPalette,
      sceneCount: consolidatedBrief.sceneCount,
      audienceProfile: consolidatedBrief.audienceProfile,
      strategy: consolidatedBrief.strategy,
      storyboard: consolidatedBrief.storyboard,
    };

    console.log("\n3. Running Stage 4 (Design System)...");
    const resolvedBrief = runStage4(brief);
    console.log("Stage 4 Success:", JSON.stringify(resolvedBrief, null, 2));

    console.log("\nConsolidated pipeline stages succeeded!");
  } catch (error: any) {
    console.error("Test failed with error:", error);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
  }
}

main();
