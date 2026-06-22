import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/auth-server";

const ANALYTICS_FILE = path.join(process.cwd(), "src/data/generation-analytics.json");

export interface AnalyticsEntry {
  id?: string;
  prompt: string;
  template: string;
  color_palette: string;
  auditor_score: number;
  compile_score: number;
  refinement_count: number;
  generation_duration_ms: number;
  render_duration_ms: number;
  success_rate: number; // 0.0 to 1.0 representation
  failure_cause?: string;
  user_id?: string;
  created_at: string;
}

/**
 * Read local analytics file entries.
 */
function readLocalAnalytics(): AnalyticsEntry[] {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[Analytics Engine] Failed to read local analytics:", error);
  }
  return [];
}

/**
 * Write analytics entry locally.
 */
function writeLocalAnalytics(entry: AnalyticsEntry) {
  try {
    const entries = readLocalAnalytics();
    entries.push(entry);

    // Keep last 100 entries locally to limit size
    if (entries.length > 100) {
      entries.shift();
    }

    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (error) {
    console.error("[Analytics Engine] Failed to write local analytics:", error);
  }
}

// POST: Save new generation metrics
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      template,
      colorPalette,
      auditorScore,
      compileScore,
      refinementCount,
      generationDurationMs,
      renderDurationMs,
      failureCause,
    } = body;

    const user = await getUserFromRequest(req);
    const userId = user?.id || undefined;

    const successRate = (compileScore === 100 && auditorScore >= 80) ? 1.0 : 0.0;

    const entry: AnalyticsEntry = {
      prompt,
      template,
      color_palette: colorPalette || "Midnight Royal",
      auditor_score: auditorScore || 0,
      compile_score: compileScore || 0,
      refinement_count: refinementCount || 0,
      generation_duration_ms: generationDurationMs || 0,
      render_duration_ms: renderDurationMs || 0,
      success_rate: successRate,
      failure_cause: failureCause || null,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // 1. Save locally
    writeLocalAnalytics(entry);

    // 2. Save to Supabase (if configured)
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
            user_id: entry.user_id || null,
          },
        ]);
        if (error) throw error;
      } catch (err) {
        console.warn("[Analytics Engine] Failed to save to Supabase, fallback to local:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Analytics Engine] POST handler error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to log analytics" }, { status: 500 });
  }
}

// GET: Retrieve aggregated analytics summaries for the dashboard
export async function GET() {
  try {
    let entries: AnalyticsEntry[] = [];

    // 1. Attempt to fetch from Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("generation_analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (data && data.length > 0) {
          entries = data as AnalyticsEntry[];
        }
      } catch (err) {
        console.warn("[Analytics Engine] Supabase read failed, falling back to local file:", err);
      }
    }

    // 2. Fallback to local file
    if (entries.length === 0) {
      entries = readLocalAnalytics();
    }

    if (entries.length === 0) {
      // Return empty default metrics
      return NextResponse.json({
        totalGenerations: 0,
        successRate: 0,
        avgQualityScore: 0,
        avgRefinementAttempts: 0,
        bestTemplates: [],
        bestPrompts: [],
        failureCauses: { compile: 0, audit: 0, none: 0 },
      });
    }

    const total = entries.length;
    const successful = entries.filter((e) => e.compile_score === 100 && e.auditor_score >= 80).length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    const avgQuality = Math.round(entries.reduce((sum, e) => sum + e.auditor_score, 0) / total);
    const avgRefinement = parseFloat((entries.reduce((sum, e) => sum + e.refinement_count, 0) / total).toFixed(1));

    // Aggregate templates: calculate avg score and success rate per template style
    const templateGroups: Record<string, { total: number; sum: number; successCount: number }> = {};
    for (const entry of entries) {
      const name = entry.template;
      if (!templateGroups[name]) {
        templateGroups[name] = { total: 0, sum: 0, successCount: 0 };
      }
      templateGroups[name].total++;
      templateGroups[name].sum += entry.auditor_score;
      if (entry.compile_score === 100 && entry.auditor_score >= 80) {
        templateGroups[name].successCount++;
      }
    }

    const bestTemplates = Object.entries(templateGroups)
      .map(([name, stats]) => ({
        name,
        avgScore: Math.round(stats.sum / stats.total),
        successRate: Math.round((stats.successCount / stats.total) * 100),
        count: stats.total,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Best performing prompts (score >= 90)
    const bestPrompts = entries
      .filter((e) => e.auditor_score >= 90)
      .map((e) => ({
        prompt: e.prompt,
        score: e.auditor_score,
        template: e.template,
        date: e.created_at,
      }))
      .slice(0, 5);

    // Failure causes mapping
    const failureCauses = { compile: 0, audit: 0, none: 0 };
    for (const entry of entries) {
      if (entry.compile_score < 100) {
        failureCauses.compile++;
      } else if (entry.auditor_score < 80) {
        failureCauses.audit++;
      } else {
        failureCauses.none++;
      }
    }

    return NextResponse.json({
      totalGenerations: total,
      successRate,
      avgQualityScore: avgQuality,
      avgRefinementAttempts: avgRefinement,
      bestTemplates,
      bestPrompts,
      failureCauses,
    });
  } catch (error) {
    console.error("[Analytics Engine] GET handler error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to retrieve analytics" }, { status: 500 });
  }
}
