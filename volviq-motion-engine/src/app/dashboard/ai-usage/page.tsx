"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface ModelUsageBreakdown {
  model: string;
  requests: number;
  avgLatencyMs: number;
  totalTokens: number;
  errorCount: number;
  errorRate: number;
}

interface QuotaMetrics {
  tokenQuotaTotal: number;
  tokenQuotaUsed: number;
  tokenQuotaRemaining: number;
}

interface AggregatedMetrics {
  totalRequests: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
  errorRate: number;
  quota: QuotaMetrics | null;
  modelBreakdown: ModelUsageBreakdown[];
}

interface RecentRequest {
  id: string;
  model: string;
  taskType: string;
  latencyMs: number;
  totalTokens: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface UsageData {
  metrics: AggregatedMetrics;
  recentRequests: RecentRequest[];
}

// ── Model Router Reference ──────────────────────────────────────────────────

const TASK_MODEL_MAP = [
  { task: "Storyboarding", model: "deepseek-v4-pro", fallback: "kimi-k2.6" },
  { task: "Remotion Generation", model: "qwen3-coder-plus", fallback: "gemma-4-31b-it" },
  { task: "Fast Operations", model: "deepseek-v4-flash", fallback: "glm-4.7-flash" },
  { task: "Quality Assurance", model: "qwen3-coder-plus", fallback: "gemma-4-31b-it" },
  { task: "Validation", model: "deepseek-v4-flash", fallback: "glm-4.7-flash" },
  { task: "Skill Detection", model: "deepseek-v4-flash", fallback: "glm-4.7-flash" },
];

// ── Dashboard Page ──────────────────────────────────────────────────────────

export default function AIUsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-usage");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15_000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  const metrics = data?.metrics;
  const quota = metrics?.quota;

  return (
    <div style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Usage Dashboard</h1>
          <p style={styles.subtitle}>
            Qevaro API · Real-time monitoring & model routing
          </p>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.dot} />
          <span style={styles.badgeText}>
            {loading ? "Loading..." : error ? "Error" : "Live"}
          </span>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span style={{ fontWeight: 600 }}>Error:</span> {error}
        </div>
      )}

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div style={styles.cardGrid}>
        <StatCard
          label="Total Requests"
          value={metrics?.totalRequests ?? 0}
          icon="📡"
        />
        <StatCard
          label="Tokens Used"
          value={formatNumber(metrics?.totalTokensUsed ?? 0)}
          icon="🔤"
        />
        <StatCard
          label="Avg Latency"
          value={`${metrics?.averageLatencyMs ?? 0}ms`}
          icon="⚡"
        />
        <StatCard
          label="Error Rate"
          value={`${((metrics?.errorRate ?? 0) * 100).toFixed(1)}%`}
          icon="🛡️"
          highlight={metrics?.errorRate ? metrics.errorRate > 0.05 : false}
        />
      </div>

      {/* ── Token Quota ─────────────────────────────────────────────────── */}
      {quota && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Token Quota</h2>
          <div style={styles.quotaRow}>
            <span style={styles.quotaLabel}>
              {formatNumber(quota.tokenQuotaUsed)} / {formatNumber(quota.tokenQuotaTotal)} tokens
            </span>
            <span style={styles.quotaRemaining}>
              {formatNumber(quota.tokenQuotaRemaining)} remaining
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min(
                  (quota.tokenQuotaUsed / quota.tokenQuotaTotal) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Model Routing Table ─────────────────────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Model Routing Strategy</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Primary Model</th>
                <th style={styles.th}>Fallback</th>
              </tr>
            </thead>
            <tbody>
              {TASK_MODEL_MAP.map((row) => (
                <tr key={row.task} style={styles.tr}>
                  <td style={styles.td}>{row.task}</td>
                  <td style={styles.tdModel}>
                    <span style={styles.modelBadge}>{row.model}</span>
                  </td>
                  <td style={styles.tdModel}>
                    <span style={styles.fallbackBadge}>{row.fallback}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Per-Model Breakdown ─────────────────────────────────────────── */}
      {metrics?.modelBreakdown && metrics.modelBreakdown.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Model Performance</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Requests</th>
                  <th style={styles.th}>Avg Latency</th>
                  <th style={styles.th}>Tokens</th>
                  <th style={styles.th}>Errors</th>
                  <th style={styles.th}>Error Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.modelBreakdown.map((m) => (
                  <tr key={m.model} style={styles.tr}>
                    <td style={styles.tdModel}>
                      <span style={styles.modelBadge}>{m.model}</span>
                    </td>
                    <td style={styles.td}>{m.requests}</td>
                    <td style={styles.td}>{m.avgLatencyMs}ms</td>
                    <td style={styles.td}>{formatNumber(m.totalTokens)}</td>
                    <td style={styles.td}>{m.errorCount}</td>
                    <td style={{
                      ...styles.td,
                      color: m.errorRate > 0.05 ? "#ef4444" : "#22c55e",
                    }}>
                      {(m.errorRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Requests ─────────────────────────────────────────────── */}
      {data?.recentRequests && data.recentRequests.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Requests</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Task</th>
                  <th style={styles.th}>Latency</th>
                  <th style={styles.th}>Tokens</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRequests
                  .slice()
                  .reverse()
                  .map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={styles.tdModel}>
                        <span style={styles.modelBadge}>{r.model}</span>
                      </td>
                      <td style={styles.td}>{r.taskType}</td>
                      <td style={styles.td}>{r.latencyMs}ms</td>
                      <td style={styles.td}>{r.totalTokens}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusDot,
                            backgroundColor: r.success ? "#22c55e" : "#ef4444",
                          }}
                        />
                        {r.success ? "OK" : "Error"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!loading && metrics?.totalRequests === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <h3 style={styles.emptyTitle}>No AI requests yet</h3>
          <p style={styles.emptyText}>
            Generate a motion graphic to see usage data here.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Component ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderColor: highlight ? "#ef4444" : "rgba(255,255,255,0.06)",
      }}
    >
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#e2e8f0",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#f1f5f9",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 100,
    border: "1px solid rgba(34,197,94,0.3)",
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    boxShadow: "0 0 8px #22c55e88",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#22c55e",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },

  // Error banner
  errorBanner: {
    padding: "12px 16px",
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    fontSize: 13,
    marginBottom: 24,
  },

  // Cards grid
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },

  // Stat card
  statCard: {
    padding: "24px 20px",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  statIcon: { fontSize: 20, marginBottom: 12 },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.02em",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 500,
  },

  // Generic card
  card: {
    padding: "24px",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#f1f5f9",
    margin: "0 0 16px 0",
    letterSpacing: "-0.01em",
  },

  // Quota
  quotaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quotaLabel: { fontSize: 14, color: "#94a3b8" },
  quotaRemaining: { fontSize: 14, color: "#22c55e", fontWeight: 500 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
    transition: "width 0.6s ease-out",
  },

  // Table
  tableWrapper: { overflowX: "auto" as const },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  td: {
    padding: "10px 12px",
    color: "#94a3b8",
  },
  tdModel: {
    padding: "10px 12px",
  },
  modelBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    backgroundColor: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fallbackBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    backgroundColor: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  statusDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    marginRight: 6,
  },

  // Empty state
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 24px",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.08)",
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#f1f5f9",
    margin: "0 0 8px 0",
  },
  emptyText: { fontSize: 14, color: "#64748b", margin: 0 },
};
