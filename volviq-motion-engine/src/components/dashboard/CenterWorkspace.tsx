"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  MotionWorkspace,
  type MotionWorkspaceRef,
} from "@/components/workspace/MotionWorkspace";
import type { UserProfile } from "@/types/profile";
import BorderGlow from "@/components/animations/BorderGlow";
import GlareHover from "@/components/animations/GlareHover";
import { getPlanLimit } from "@/lib/plans";

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
    <div className="flex flex-1 flex-col h-full overflow-hidden p-6 md:p-8 justify-between">
      {/* Top Header Row with Usage Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 w-full shrink-0">
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

      {/* Centered Prompt Box Area */}
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-6 items-center justify-center flex-1">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest font-mono">
            Motion Generation Console
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight md:text-3xl text-center leading-tight">
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
      </div>

      {/* Spacer to push prompt box exactly to the vertical center (balancing header) */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
}
