import { logger } from "@/utils/logger";

export type MetricKind =
  | "generation_request"
  | "generation_success"
  | "generation_failure"
  | "render_duration";

interface MetricEvent {
  kind: MetricKind;
  durationMs?: number;
  success?: boolean;
  meta?: Record<string, unknown>;
}

const metricsBuffer: MetricEvent[] = [];

export function trackMetric(event: MetricEvent): void {
  metricsBuffer.push({ ...event, meta: { ...event.meta, at: Date.now() } });
  if (metricsBuffer.length > 200) {
    metricsBuffer.shift();
  }

  logger.debug("monitoring", event.kind, {
    durationMs: event.durationMs,
    success: event.success,
    ...event.meta,
  });
}

export function startTimer(): () => number {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

export function getRecentMetrics(): MetricEvent[] {
  return [...metricsBuffer];
}


