"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function FavoritesPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">Favorites</h1>
        <p className="mt-2 text-muted-foreground">
          Saved templates and generations will appear here.
        </p>
      </div>
    </DashboardShell>
  );
}
