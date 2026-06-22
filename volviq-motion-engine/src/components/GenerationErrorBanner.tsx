"use client";

import { Button } from "@/components/ui/button";
import type { UserFacingGenerationError } from "@/lib/generation-errors";
import { AlertCircle, RotateCcw } from "lucide-react";

interface GenerationErrorBannerProps {
  error: UserFacingGenerationError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const CODE_EMOJI: Record<string, string> = {
  api_key_missing: "🔑",
  api_unavailable: "⚠️",
  rate_limit: "⏱️",
  auth_failed: "🔒",
  invalid_prompt: "✏️",
  network_error: "🌐",
  render_failed: "🎬",
  limit_reached: "📊",
  unknown: "❌",
};

export function GenerationErrorBanner({
  error,
  onRetry,
  onDismiss,
}: GenerationErrorBannerProps) {
  const emoji = CODE_EMOJI[error.code] ?? "❌";

  return (
    <div
      className="mx-4 mb-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {emoji} {error.title}
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <p className="text-xs text-muted-foreground-dim">
            <span className="font-medium">Suggested action:</span> {error.action}
          </p>
          {error.detail && error.detail !== error.message && (
            <pre className="max-h-24 overflow-auto rounded bg-background/60 p-2 text-[10px] text-destructive/90 font-mono whitespace-pre-wrap break-words">
              {error.detail}
            </pre>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {onRetry && (
              <Button type="button" size="sm" variant="default" onClick={onRetry}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
