import fs from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const ANALYTICS_FILE = path.join(process.cwd(), "src/data/generation-analytics.json");

export interface LogAnalyticsPayload {
  prompt: string;
  template: string;
  colorPalette: string;
  auditorScore: number;
  compileScore: number;
  refinementCount: number;
  generationDurationMs: number;
  renderDurationMs: number;
  failureCause?: string | null;
  userId?: string | null;
}

export async function logGenerationAnalytics(payload: LogAnalyticsPayload) {
  const successRate = (payload.compileScore === 100 && payload.auditorScore >= 80) ? 1.0 : 0.0;

  const entry = {
    prompt: payload.prompt,
    template: payload.template,
    color_palette: payload.colorPalette || "Midnight Royal",
    auditor_score: payload.auditorScore || 0,
    compile_score: payload.compileScore || 0,
    refinement_count: payload.refinementCount || 0,
    generation_duration_ms: payload.generationDurationMs || 0,
    render_duration_ms: payload.renderDurationMs || 0,
    success_rate: successRate,
    failure_cause: payload.failureCause || null,
    user_id: payload.userId || null,
    created_at: new Date().toISOString(),
  };

  // 1. Log locally
  try {
    let localEntries = [];
    if (fs.existsSync(ANALYTICS_FILE)) {
      const fileData = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      localEntries = JSON.parse(fileData);
    }
    localEntries.push(entry);
    if (localEntries.length > 100) {
      localEntries.shift();
    }
    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(localEntries, null, 2), "utf-8");
    console.log("[Monitoring-Server] Logged generation analytics locally.");
  } catch (error) {
    console.error("[Monitoring-Server] Failed to write local analytics:", error);
  }

  // 2. Log to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("generation_analytics").insert([
        {
          prompt: entry.prompt,
          template: entry.template,
          color_palette: entry.color_palette,
          auditor_score: entry.auditor_score,
          compile_score: entry.compile_score,
          refinement_count: entry.refinement_count,
          generation_duration_ms: entry.generation_duration_ms,
          render_duration_ms: entry.render_duration_ms,
          success_rate: entry.success_rate,
          failure_cause: entry.failure_cause,
          user_id: entry.user_id,
        },
      ]);
      if (error) throw error;
      console.log("[Monitoring-Server] Logged generation analytics to Supabase.");
    } catch (err) {
      console.warn("[Monitoring-Server] Supabase analytics save failed:", err);
    }
  }
}
