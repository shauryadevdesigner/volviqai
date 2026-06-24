"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  MotionWorkspace,
  type MotionWorkspaceRef,
} from "@/components/workspace/MotionWorkspace";
import { getExamplePrompts } from "@/lib/recommendations";
import type { UserProfile } from "@/types/profile";
import BorderGlow from "@/components/animations/BorderGlow";
import GlareHover from "@/components/animations/GlareHover";
import { getPlanLimit } from "@/lib/plans";

const QUICK_ACTIONS = [
  { label: "Product Ad", prompt: "Create a premium product advertisement with cinematic motion" },
  { label: "Motion Graphic", prompt: "Generate a bold motion graphic ad with kinetic typography" },
  { label: "Reel Generator", prompt: "Create a vertical Instagram reel with energetic text animations" },
  { label: "Campaign Builder", prompt: "Design a multi-scene brand campaign with logo reveal" },
  { label: "Video Ad", prompt: "Generate a 20-second video ad with smooth transitions" },
];

interface CenterWorkspaceProps {
  profile: UserProfile | null;
  accessToken: string | null;
  onRefreshProfile: () => void;
  externalPrompt?: string;
}

export function CenterWorkspace({
  profile,
  accessToken,
  onRefreshProfile,
  externalPrompt,
}: CenterWorkspaceProps) {
  const [prompt, setPrompt] = useState("");
  const [workspaceActive, setWorkspaceActive] = useState(false);
  const [startPrompt, setStartPrompt] = useState("");
  const workspaceRef = useRef<MotionWorkspaceRef | null>(null);

  const examples = getExamplePrompts(profile);

  const beginGeneration = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setStartPrompt(trimmed);
    setWorkspaceActive(true);
    setTimeout(() => {
      workspaceRef.current?.setPrompt(trimmed);
      workspaceRef.current?.triggerGeneration();
    }, 150);
  };

  useEffect(() => {
    if (externalPrompt?.trim()) {
      beginGeneration(externalPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when external prompt changes
  }, [externalPrompt]);

  if (workspaceActive) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background/20">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-background-elevated/40 backdrop-blur-sm">
          <p className="truncate text-sm text-muted-foreground">
            {startPrompt}
          </p>
          <button
            type="button"
            onClick={() => {
              setWorkspaceActive(false);
              setStartPrompt("");
              setPrompt("");
            }}
            className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            New prompt
          </button>
        </div>
        <MotionWorkspace
          ref={workspaceRef}
          initialPrompt={startPrompt}
          autoStart
          accessToken={accessToken}
          compact
          onGenerationComplete={onRefreshProfile}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
      {/* Top Header Row with Usage Gauge */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Creative Engine</h2>
          <p className="text-xs text-muted-foreground font-mono">Calibration state: Active // Node 0x9f</p>
        </div>
        {profile && (
          <div className="flex flex-col gap-1.5 w-full sm:w-60 bg-muted/20 border border-border/40 rounded-lg p-3">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">Generations</span>
              <span className="text-primary font-bold">
                {profile.generations_used_this_month} / {getPlanLimit(profile.plan)} used
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted-foreground-dim/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-hover shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (profile.generations_used_this_month / getPlanLimit(profile.plan)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="space-y-6">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest font-mono">
              Motion Generation Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight md:text-3xl">
            What would you like Volviq to create today?
          </h1>

          {/* Glowing Glass Input Box */}
          <BorderGlow
            backgroundColor="#1c1b1b"
            borderRadius={12}
            glowColor="270 100 50"
            glowIntensity={0.5}
            glowRadius={50}
            colors={["#ffffff", "#8e9192", "#353535"]}
            fillOpacity={0.08}
            className="w-full shadow-2xl transition-all duration-300"
          >
            <GlareHover
              width="100%"
              height="100%"
              background="transparent"
              borderRadius="12px"
              borderColor="transparent"
              glareColor="#ffffff"
              glareOpacity={0.08}
              glareSize={150}
              className="p-1"
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    beginGeneration(prompt);
                  }
                }}
                placeholder="Describe your motion graphic, ad, or reel in natural language..."
                rows={4}
                className="w-full resize-none bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base"
              />
              <div className="flex items-center justify-between border-t border-border/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground font-mono">Press Enter to generate</span>
                <button
                  type="button"
                  onClick={() => beginGeneration(prompt)}
                  disabled={!prompt.trim()}
                  className="rounded-md bg-primary hover:bg-primary-hover px-5 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-40 shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95 cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </GlareHover>
          </BorderGlow>

          {/* Quick Examples Selection (Starter Seeds) */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-dim block">
              // Starter Seeds
            </span>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPrompt(ex);
                    beginGeneration(ex);
                  }}
                  className="rounded-full border border-border/50 bg-background-elevated/30 px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground hover:bg-primary/5 cursor-pointer"
                >
                  {ex.length > 50 ? `${ex.slice(0, 50)}…` : ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Card Grid for Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-dim">
            // Creative Blueprints
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => beginGeneration(a.prompt)}
                className="group relative flex flex-col gap-1.5 rounded-xl border border-border/50 bg-background-elevated/40 p-4 text-left transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:translate-y-[-2px] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between w-full">
                  {a.label}
                  <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-all text-primary" />
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {a.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
