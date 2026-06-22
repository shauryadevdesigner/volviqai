"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  MotionWorkspace,
  type MotionWorkspaceRef,
} from "@/components/workspace/MotionWorkspace";
import { getExamplePrompts } from "@/lib/recommendations";
import type { UserProfile } from "@/types/profile";

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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
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
            className="text-xs text-primary hover:underline"
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
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Creative workspace
          </span>
        </div>
        <h1 className="mb-8 text-center text-2xl font-semibold text-foreground md:text-3xl">
          What would you like Volviq to create today?
        </h1>

        <div className="rounded-xl border border-border bg-background-elevated p-2 shadow-lg">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                beginGeneration(prompt);
              }
            }}
            placeholder="Describe your motion graphic, ad, or reel…"
            rows={4}
            className="w-full resize-none bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex justify-end border-t border-border px-2 py-2">
            <button
              type="button"
              onClick={() => beginGeneration(prompt)}
              disabled={!prompt.trim()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setPrompt(ex);
                beginGeneration(ex);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Quick actions
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => beginGeneration(a.prompt)}
                className="rounded-lg border border-border bg-background-elevated px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
