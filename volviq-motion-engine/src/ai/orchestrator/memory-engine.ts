import { CreativeMemoryEntry } from "./types";

let memoryCache: CreativeMemoryEntry[] = [];

export function readCreativeMemory(): CreativeMemoryEntry[] {
  return [...memoryCache];
}

export function saveToCreativeMemory(entry: CreativeMemoryEntry) {
  try {
    memoryCache.push(entry);
    // Limit cache size to last 50 successful creations
    if (memoryCache.length > 50) {
      memoryCache.shift();
    }
    console.log("Saved successful generation to in-memory creative memory database.");
  } catch (error) {
    console.error("Failed to save to in-memory creative memory:", error);
  }
}
