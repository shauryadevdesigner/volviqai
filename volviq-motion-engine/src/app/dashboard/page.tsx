"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import {
  DashboardSidebar,
  DashboardSidebarMobileToggle,
} from "@/components/dashboard/DashboardSidebar";
import { CenterWorkspace } from "@/components/dashboard/CenterWorkspace";
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { getRecommendations } from "@/lib/recommendations";

export default function DashboardPage() {
  const { profile, loading, accessToken, refreshProfile, logout } =
    useRequireAuth();
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTemplateSelect = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const templates = getRecommendations(profile);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background bg-tech-grid">
      {/* Futuristic Background Accents */}
      <div className="scanline" />
      <div className="noise-overlay" />

      <DashboardSidebarMobileToggle onClick={() => setMobileNavOpen(true)} />
      <DashboardSidebar
        profile={profile}
        onLogout={logout}
        onSelectTemplate={handleTemplateSelect}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />
      <main className="relative flex min-w-0 flex-1 flex-col bg-background/30 backdrop-blur-md border-r border-border/40 z-10">
        <CenterWorkspace
          profile={profile}
          accessToken={accessToken}
          externalPrompt={externalPrompt}
          onRefreshProfile={() => {
            void refreshProfile();
          }}
        />
      </main>
      <RecommendationPanel
        templates={templates}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}
