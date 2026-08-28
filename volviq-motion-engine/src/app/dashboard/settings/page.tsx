"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { getPlanLimit } from "@/lib/plans";

export default function SettingsPage() {
  const { profile } = useRequireAuth();

  return (
    <DashboardShell>
      <div className="max-w-xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Your profile and workspace.</p>

        <div className="mt-8 space-y-4 rounded-xl border border-border bg-background-elevated p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Display name
            </p>
            <p className="mt-1 text-foreground">
              {profile?.display_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Username
            </p>
            <p className="mt-1 text-foreground">{profile?.username || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Plan
            </p>
            <p className="mt-1 capitalize text-foreground">
              {profile?.plan || "free"} — {profile ? getPlanLimit(profile.plan) : 3}{" "}
              generations / month
            </p>
          </div>
          {profile?.goals && profile.goals.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Goals
              </p>
              <p className="mt-1 text-foreground">{profile.goals.join(", ")}</p>
            </div>
          )}
          {profile?.platform && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Primary platform
              </p>
              <p className="mt-1 text-foreground">{profile.platform}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
