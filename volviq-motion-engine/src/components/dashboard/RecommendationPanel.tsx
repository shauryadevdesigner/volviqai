"use client";

import type { TemplateCard } from "@/data/recommended-templates";

interface RecommendationPanelProps {
  templates: TemplateCard[];
  onSelectTemplate: (prompt: string) => void;
}

export function RecommendationPanel({
  templates,
  onSelectTemplate,
}: RecommendationPanelProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-background-elevated p-4">
      <h3 className="mb-1 text-sm font-semibold text-foreground">
        Recommended for you
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Based on your onboarding preferences
      </p>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTemplate(t.prompt)}
            className="rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {t.description}
            </p>
            <span className="mt-2 inline-block text-[10px] uppercase tracking-wider text-primary">
              {t.aspect}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
