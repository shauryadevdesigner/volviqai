import dotenv from "dotenv";
dotenv.config();

import { runStage0 } from "./orchestrator/stages/stage0-intent";

async function main() {
  console.log("Testing Stage 0 (Intent Classifier)...");
  try {
    const result = await runStage0("Create a premium luxury reveal ad for a wristwatch");
    console.log("Success! Result:", result);
  } catch (error: any) {
    console.error("Error occurred:");
    console.error(error);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
  }
}

main();
