"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Layers } from "lucide-react";
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto w-full">
        {/* Left/Middle: Prompt Input & Selection */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Modern Card Grid for Quick Actions */}
          <div className="mt-8">
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground-dim">
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

        {/* Right side: Real-time Telemetry Control Panel */}
        <div className="space-y-6 lg:border-l lg:border-border/30 lg:pl-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest">// Engine Telemetry</span>
          </div>

          <div className="rounded-xl border border-border/40 bg-background-elevated/30 backdrop-blur-md p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border/30 pb-3">
              <span className="text-[11px] font-mono text-muted-foreground">RENDER STAGE</span>
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Render diagnostics progress bars */}
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>GPU CALIBRATION (CUDA)</span>
                  <span className="text-primary font-semibold">89%</span>
                </div>
                <div className="h-1 bg-muted-foreground-dim/15 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[89%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>VRAM OCCUPANCY</span>
                  <span className="text-primary font-semibold">4.2 GB / 16 GB</span>
                </div>
                <div className="h-1 bg-muted-foreground-dim/15 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/80 w-[26%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>NODE COMPILER RATINGS</span>
                  <span className="text-green-400 font-semibold">OPTIMAL</span>
                </div>
                <div className="h-1 bg-muted-foreground-dim/15 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500/80 w-[95%]" />
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 pt-3 mt-2 space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API LATENCY:</span>
                <span className="text-primary font-semibold">14ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ACTIVE PIPELINES:</span>
                <span className="text-primary font-semibold">4/4 Nodes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ENGINE CORE:</span>
                <span className="text-primary">Stitch-v4.09</span>
              </div>
            </div>
          </div>

          {/* Quick Examples Selection */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground-dim block">
              // Starter Seeds
            </span>
            <div className="flex flex-col gap-2">
              {examples.slice(0, 3).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPrompt(ex);
                    beginGeneration(ex);
                  }}
                  className="rounded-lg border border-border/40 bg-background-elevated/20 px-3 py-2 text-xs text-muted-foreground text-left transition-all duration-200 hover:border-primary/30 hover:text-foreground hover:bg-muted/10 truncate w-full block cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
