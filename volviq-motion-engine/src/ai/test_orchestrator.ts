import dotenv from "dotenv";
dotenv.config();

import { runStage0 } from "./orchestrator/stages/stage0-intent";
import { runStage1 } from "./orchestrator/stages/stage1-creative";
import { runStage2 } from "./orchestrator/stages/stage2-marketing";
import { runStage3 } from "./orchestrator/stages/stage3-storyboard";
import { runStage4 } from "./orchestrator/stages/stage4-design";
import { runStage5 } from "./orchestrator/stages/stage5-asset-plan";

async function main() {
  const prompt = "Create a premium luxury reveal ad for a wristwatch";
  try {
    console.log("1. Running Stage 0 (Intent Classifier)...");
    const intent = await runStage0(prompt);
    console.log("Stage 0 Success:", intent);

    console.log("\n2. Running Stage 1 (Creative Brief)...");
    const creativeBrief = await runStage1(prompt, intent);
    console.log("Stage 1 Success:", creativeBrief);

    console.log("\n3. Running Stage 2 (Marketing Strategy)...");
    const marketingStrategy = await runStage2(creativeBrief, intent);
    console.log("Stage 2 Success:", marketingStrategy);

    console.log("\n4. Running Stage 3 (Storyboard Brief)...");
    const brief = await runStage3(marketingStrategy, intent);
    console.log("Stage 3 Success:", brief);

    console.log("\n5. Running Stage 4 (Design System)...");
    const resolvedBrief = runStage4(brief);
    console.log("Stage 4 Success:", resolvedBrief);

    console.log("\n6. Running Stage 5 (Asset Plan)...");
    const assetPlan = await runStage5(resolvedBrief);
    console.log("Stage 5 Success:", assetPlan);

    console.log("\nAll tested stages succeeded!");
  } catch (error: any) {
    console.error("Test failed with error:", error);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
  }
}

main();
