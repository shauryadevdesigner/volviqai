import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

let localTemplatesCache: CachedTemplate[] = [];

export interface CachedTemplate {
  id?: string;
  prompt: string;
  template_name: string;
  color_palette: string;
  storyboard: any[];
  code: string;
  auditor_score: number;
  created_at: string;
}

/**
 * Reads approved templates from the local JSON cache.
 */
export function readLocalTemplates(): CachedTemplate[] {
  return [...localTemplatesCache];
}

/**
 * Saves a successful approved template (Score >= 95) to cache.
 */
export async function saveTemplateToCache(
  prompt: string,
  templateName: string,
  colorPalette: string,
  storyboard: any[],
  code: string,
  auditorScore: number
): Promise<void> {
  const newTemplate: CachedTemplate = {
    prompt,
    template_name: templateName,
    color_palette: colorPalette,
    storyboard,
    code,
    auditor_score: auditorScore,
    created_at: new Date().toISOString(),
  };

  // 1. Save locally
  try {
    localTemplatesCache.push(newTemplate);

    // Limit cache size to top 30 templates to prevent massive memory usage
    if (localTemplatesCache.length > 30) {
      localTemplatesCache.shift();
    }

    console.log("[Template Cache] Saved approved template locally in-memory.");
  } catch (err) {
    console.error("[Template Cache] Failed to save approved template locally:", err);
  }

  // 2. Save to Supabase (if configured)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("approved_templates").insert([
        {
          prompt,
          template_name: templateName,
          color_palette: colorPalette,
          storyboard,
          code,
          auditor_score: auditorScore,
        },
      ]);
      if (error) throw error;
      console.log("[Template Cache] Saved approved template to Supabase cloud.");
    } catch (err) {
      console.warn("[Template Cache] Supabase save failed, relying on local cache:", err);
    }
  }
}

/**
 * Searches the approved template cache for a template with matching category.
 * Performs a keyword overlap search on the prompts to select the best match,
 * falling back to the highest scoring template in that category.
 */
export async function findSimilarTemplate(
  prompt: string,
  templateName: string
): Promise<CachedTemplate | null> {
  let templates: CachedTemplate[] = [];

  // 1. Try to load from Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("approved_templates")
        .select("*")
        .eq("template_name", templateName)
        .order("auditor_score", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        templates = data as CachedTemplate[];
      }
    } catch (err) {
      console.warn("[Template Cache] Supabase lookup failed, falling back to local file:", err);
    }
  }

  // 2. Fall back to local file if Supabase returned nothing or failed
  if (templates.length === 0) {
    const local = readLocalTemplates();
    templates = local.filter((t) => t.template_name === templateName);
  }

  if (templates.length === 0) {
    return null;
  }

  // Tokenize the prompt for keyword overlap comparison
  const promptWords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3); // Only match words longer than 3 chars

  if (promptWords.length === 0) {
    // If prompt is too short/empty, return the highest scoring one
    return templates.sort((a, b) => b.auditor_score - a.auditor_score)[0];
  }

  let bestMatch: CachedTemplate | null = null;
  let maxOverlap = 0;

  for (const temp of templates) {
    const tempWords = temp.prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const overlap = promptWords.filter((w) => tempWords.includes(w)).length;
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = temp;
    }
  }

  // If there's keyword overlap, use the best matched template
  if (bestMatch && maxOverlap > 0) {
    console.log(`[Template Cache] Found matching template layout with keyword overlap (${maxOverlap} words).`);
    return bestMatch;
  }

  // Otherwise, fallback to the highest scoring template in this category
  console.log("[Template Cache] No keyword overlap. Returning highest scoring template in category.");
  return templates.sort((a, b) => b.auditor_score - a.auditor_score)[0];
}
