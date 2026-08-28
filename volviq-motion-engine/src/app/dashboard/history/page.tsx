"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="mt-2 text-muted-foreground">
          Your past projects will appear here.
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No projects yet.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Create your first motion graphic →
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
