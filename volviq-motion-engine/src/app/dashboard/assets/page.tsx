"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AssetsPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">Assets</h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage brand assets. Coming soon.
        </p>
      </div>
    </DashboardShell>
  );
}
