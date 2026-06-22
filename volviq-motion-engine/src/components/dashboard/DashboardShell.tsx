"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  DashboardSidebar,
  DashboardSidebarMobileToggle,
} from "@/components/dashboard/DashboardSidebar";
import { useRequireAuth } from "@/components/providers/AuthProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout } = useRequireAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebarMobileToggle onClick={() => setMobileNavOpen(true)} />
      <DashboardSidebar
        profile={profile}
        onLogout={logout}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
