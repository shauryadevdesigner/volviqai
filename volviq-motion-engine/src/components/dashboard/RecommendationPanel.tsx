"use client";

import type { TemplateCard } from "@/data/recommended-templates";
import { Sparkles, Film } from "lucide-react";

interface RecommendationPanelProps {
  templates: TemplateCard[];
  onSelectTemplate: (prompt: string) => void;
}

export function RecommendationPanel({
  templates,
  onSelectTemplate,
}: RecommendationPanelProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border/40 bg-background-elevated/30 backdrop-blur-md p-5 z-15">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Recommended Seeds
        </h3>
      </div>
      <p className="mb-5 text-[11px] text-muted-foreground leading-relaxed">
        Autonomous templates tailored to your onboard profile configuration.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTemplate(t.prompt)}
            className="group relative rounded-xl border border-border/50 bg-background/30 p-4 text-left transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:translate-y-[-2px] overflow-hidden cursor-pointer"
          >
            {/* Subtle glow layer on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {t.title}
              </p>
              <Film className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-0.5" />
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 group-hover:text-muted-foreground transition-colors">
              {t.description}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-block text-[9px] font-mono tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                {t.aspect}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                LOAD SEED →
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
