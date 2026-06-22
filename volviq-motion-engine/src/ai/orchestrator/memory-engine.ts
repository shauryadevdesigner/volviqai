import fs from "fs";
import path from "path";
import { CreativeMemoryEntry } from "./types";

const CREATIVE_MEMORY_FILE = path.join(process.cwd(), "src/data/creative-memory.json");

export function readCreativeMemory(): CreativeMemoryEntry[] {
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

export function saveToCreativeMemory(entry: CreativeMemoryEntry) {
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
