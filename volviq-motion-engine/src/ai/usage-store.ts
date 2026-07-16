// ============================================================================
// AI Provider — In-Memory Usage Metrics Store
// ============================================================================

import type {
  AIRequestRecord,
  AggregatedUsageMetrics,
  ModelUsageBreakdown,
  ProviderUsageMetrics,
} from "./types";

const MAX_RECORDS = 1000;

/**
 * Singleton in-memory store for tracking AI request metrics.
 * Used by the AI Usage Dashboard and the AI provider client.
 */
class UsageStore {
  private records: AIRequestRecord[] = [];
  private latestQuota: ProviderUsageMetrics | null = null;
  private idCounter = 0;

  /**
   * Record a completed AI request.
   */
  recordRequest(params: {
    model: string;
    taskType: string;
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    success: boolean;
    error?: string;
  }): void {
    this.idCounter++;
    const record: AIRequestRecord = {
      id: `req_${this.idCounter}_${Date.now()}`,
      model: params.model,
      taskType: params.taskType,
      latencyMs: params.latencyMs,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      totalTokens: params.totalTokens,
      success: params.success,
      error: params.error,
      timestamp: Date.now(),
    };

    this.records.push(record);

    // Evict oldest records beyond capacity
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(-MAX_RECORDS);
    }
  }

  /**
   * Update the latest token quota from response headers.
   */
  updateQuota(quota: ProviderUsageMetrics): void {
    this.latestQuota = quota;
  }

  /**
   * Get aggregated usage metrics for the dashboard.
   */
  getMetrics(): AggregatedUsageMetrics {
    const total = this.records.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        totalTokensUsed: 0,
        averageLatencyMs: 0,
        errorRate: 0,
        quota: this.latestQuota,
        modelBreakdown: [],
      };
    }

    const totalTokens = this.records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalLatency = this.records.reduce((sum, r) => sum + r.latencyMs, 0);
    const errorCount = this.records.filter((r) => !r.success).length;

    return {
      totalRequests: total,
      totalTokensUsed: totalTokens,
      averageLatencyMs: Math.round(totalLatency / total),
      errorRate: total > 0 ? errorCount / total : 0,
      quota: this.latestQuota,
      modelBreakdown: this.getModelBreakdown(),
    };
  }

  /**
   * Get per-model usage breakdown.
   */
  getModelBreakdown(): ModelUsageBreakdown[] {
    const byModel = new Map<
      string,
      {
        requests: number;
        totalLatency: number;
        totalTokens: number;
        errorCount: number;
      }
    >();

    for (const record of this.records) {
      const entry = byModel.get(record.model) ?? {
        requests: 0,
        totalLatency: 0,
        totalTokens: 0,
        errorCount: 0,
      };

      entry.requests++;
      entry.totalLatency += record.latencyMs;
      entry.totalTokens += record.totalTokens;
      if (!record.success) entry.errorCount++;

      byModel.set(record.model, entry);
    }

    const breakdown: ModelUsageBreakdown[] = [];
    for (const [model, data] of byModel) {
      breakdown.push({
        model,
        requests: data.requests,
        avgLatencyMs: Math.round(data.totalLatency / data.requests),
        totalTokens: data.totalTokens,
        errorCount: data.errorCount,
        errorRate: data.requests > 0 ? data.errorCount / data.requests : 0,
      });
    }

    // Sort by request count descending
    breakdown.sort((a, b) => b.requests - a.requests);
    return breakdown;
  }

  /**
   * Get raw records (for debugging / export).
   */
  getRecords(limit = 100): AIRequestRecord[] {
    return this.records.slice(-limit);
  }

  /**
   * Get the latest quota info.
   */
  getQuota(): ProviderUsageMetrics | null {
    return this.latestQuota;
  }
}

/**
 * Global singleton usage store instance.
 */
export const usageStore = new UsageStore();
