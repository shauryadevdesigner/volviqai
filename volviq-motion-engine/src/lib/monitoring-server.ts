import { getSupabase, isSupabaseConfigured } from "./supabase";

let localAnalyticsCache: any[] = [];

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
    localAnalyticsCache.push(entry);
    if (localAnalyticsCache.length > 100) {
      localAnalyticsCache.shift();
    }
    console.log("[Monitoring-Server] Logged generation analytics locally in-memory.");
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
    } catch (err: any) {
      if (err?.code !== "PGRST205") {
        console.warn("[Monitoring-Server] Supabase analytics save failed:", err);
      }
    }
  }
}

export interface LogFailurePayload {
  prompt: string;
  stage: string;
  errorMessage: string;
  durationMs?: number;
  userId?: string | null;
}

/**
 * Persists a hard pipeline failure (thrown error, not just a low quality
 * score) so it shows up in the analytics dashboard instead of only ever
 * existing as a console.error line that disappears once the serverless
 * instance recycles. Never throws — logging must not mask the original error.
 */
export async function logGenerationFailure(payload: LogFailurePayload) {
  const entry = {
    prompt: payload.prompt,
    template: "N/A",
    color_palette: "N/A",
    auditor_score: 0,
    compile_score: 0,
    refinement_count: 0,
    generation_duration_ms: payload.durationMs || 0,
    render_duration_ms: 0,
    success_rate: 0,
    failure_cause: `[${payload.stage}] ${payload.errorMessage}`.slice(0, 500),
    user_id: payload.userId || null,
    created_at: new Date().toISOString(),
  };

  try {
    localAnalyticsCache.push(entry);
    if (localAnalyticsCache.length > 100) {
      localAnalyticsCache.shift();
    }
  } catch {
    // best-effort only
  }

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
    } catch (err: any) {
      if (err?.code !== "PGRST205") {
        console.warn("[Monitoring-Server] Failed to persist failure record:", err);
      }
    }
  }
}
