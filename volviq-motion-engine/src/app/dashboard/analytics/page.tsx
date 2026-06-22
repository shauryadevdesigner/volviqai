"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRequireAuth } from "@/components/providers/AuthProvider";

interface TemplateStat {
  name: string;
  avgScore: number;
  successRate: number;
  count: number;
}

interface PromptStat {
  prompt: string;
  score: number;
  template: string;
  date: string;
}

interface AnalyticsData {
  totalGenerations: number;
  successRate: number;
  avgQualityScore: number;
  avgRefinementAttempts: number;
  bestTemplates: TemplateStat[];
  bestPrompts: PromptStat[];
  failureCauses: {
    compile: number;
    audit: number;
    none: number;
  };
}

export default function AnalyticsPage() {
  useRequireAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Aggregating platform metrics...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const metrics = data || {
    totalGenerations: 0,
    successRate: 0,
    avgQualityScore: 0,
    avgRefinementAttempts: 0,
    bestTemplates: [],
    bestPrompts: [],
    failureCauses: { compile: 0, audit: 0, none: 0 },
  };

  const totalFailures = metrics.failureCauses.compile + metrics.failureCauses.audit;
  const compileFailPct = totalFailures > 0 ? Math.round((metrics.failureCauses.compile / totalFailures) * 100) : 0;
  const auditFailPct = totalFailures > 0 ? Math.round((metrics.failureCauses.audit / totalFailures) * 100) : 0;

  return (
    <DashboardShell>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
            Infrastructure Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time generation stability, compilation safety, and creative quality trends.
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated p-6 transition-all hover:border-primary/30 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compilation Success</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">{metrics.successRate}%</span>
              <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Compile-Safe</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                style={{ width: `${metrics.successRate}%` }}
              ></div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated p-6 transition-all hover:border-primary/30 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-all"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Creative Score</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">{metrics.avgQualityScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Target threshold standard is &ge; 80</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated p-6 transition-all hover:border-primary/30 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Generations</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">{metrics.totalGenerations}</span>
              <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Active Runs</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Server-side compilations logged</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated p-6 transition-all hover:border-primary/30 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Refinements</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">{metrics.avgRefinementAttempts}</span>
              <span className="text-xs text-muted-foreground">loops / request</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Fail-safe auto repair limit: 3</p>
          </div>
        </div>

        {/* Charts & Template Stats Group */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Best Performing Templates list */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-background-elevated p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Top-Performing Motion Libraries</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Approved templates automatically cached for structural cloning.</p>
            </div>

            <div className="space-y-4">
              {metrics.bestTemplates.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-sm text-muted-foreground">
                  No template runs recorded yet.
                </div>
              ) : (
                metrics.bestTemplates.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t.count} run{t.count > 1 ? "s" : ""}</span>
                        <span>•</span>
                        <span>Success Rate: <span className="text-cyan-500 font-medium">{t.successRate}%</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                        <p className="text-sm font-bold text-primary">{t.avgScore} / 100</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Failure Cause distribution */}
          <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Error Distribution</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Main bottlenecks causing generation refinement loops.</p>
            </div>

            {totalFailures === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-12">
                <div className="text-center space-y-2">
                  <div className="text-green-500 font-medium text-lg">100% Stability</div>
                  <div className="text-xs">No compilation or quality rejections recorded.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Visual stacked bar chart */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-red-400">Compile Failures ({metrics.failureCauses.compile})</span>
                    <span className="text-amber-400">Audit Failures ({metrics.failureCauses.audit})</span>
                  </div>
                  <div className="h-6 w-full rounded-lg overflow-hidden flex bg-border/40">
                    {metrics.failureCauses.compile > 0 && (
                      <div className="bg-red-500 h-full transition-all" style={{ width: `${compileFailPct}%` }} title="Compile Errors"></div>
                    )}
                    {metrics.failureCauses.audit > 0 && (
                      <div className="bg-amber-500 h-full transition-all" style={{ width: `${auditFailPct}%` }} title="Audit Critique"></div>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{compileFailPct}% compile syntax</span>
                    <span>{auditFailPct}% design critique</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 block"></span>
                    <span className="text-muted-foreground">Compile Safety: Catching JSX, ts type mismatch & broken imports.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block"></span>
                    <span className="text-muted-foreground">Quality Auditor: Catching overlap, motion styles, and bad gradients.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Best Prompts (High Score Generations) */}
        <div className="rounded-2xl border border-border bg-background-elevated p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Top-Performing Generations (Approved Templates Cache)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">High-scoring runs matching the creative bar &ge; 90.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Prompt</th>
                  <th className="pb-3">Template Vibe</th>
                  <th className="pb-3 text-right">Quality Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground font-medium">
                {metrics.bestPrompts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-muted-foreground text-xs">
                      No high-performance prompt records cached yet. Run more generations to fill.
                    </td>
                  </tr>
                ) : (
                  metrics.bestPrompts.map((p, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-4 pr-4 max-w-lg truncate text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        &ldquo;{p.prompt}&rdquo;
                      </td>
                      <td className="py-4 text-xs font-mono text-cyan-400">
                        {p.template}
                      </td>
                      <td className="py-4 text-right text-sm font-bold text-primary">
                        {p.score} / 100
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
