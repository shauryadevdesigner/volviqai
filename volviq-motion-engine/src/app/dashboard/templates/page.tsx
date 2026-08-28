"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ALL_TEMPLATES } from "@/data/recommended-templates";

export default function TemplatesPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Template Marketplace
        </h1>
        <p className="mt-2 text-muted-foreground">
          Premium templates curated for your goals. More coming soon.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-background-elevated p-5"
            >
              <h3 className="font-medium text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
