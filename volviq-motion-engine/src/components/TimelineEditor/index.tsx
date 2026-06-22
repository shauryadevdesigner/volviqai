"use client";

import { useCallback, useState } from "react";
import {
  Film,
  Plus,
  Trash2,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import type {
  TimelineClip,
  TimelineItem,
  TransitionType,
} from "@/types/timeline";
import { TimelineClipItem } from "./TimelineClipItem";
import { TimelineTransitionItem } from "./TimelineTransitionItem";
import { AddTransitionButton } from "./AddTransitionButton";

interface TimelineEditorProps {
  items: TimelineItem[];
  clips: TimelineClip[];
  totalDurationFrames: number;
  hasClips: boolean;
  onAddClip: () => void;
  onRemoveClip: (id: string) => void;
  onReorderClips: (from: number, to: number) => void;
  onAddTransition: (afterClipId: string, type: TransitionType) => void;
  onRemoveTransition: (id: string) => void;
  onUpdateClipDuration: (id: string, frames: number) => void;
  onUpdateTransitionType: (id: string, type: TransitionType) => void;
  onUpdateTransitionDuration: (id: string, frames: number) => void;
  onComposeAndPreview: () => void;
  onClearTimeline: () => void;
}

export function TimelineEditor({
  items,
  clips,
  totalDurationFrames,
  hasClips,
  onAddClip,
  onRemoveClip,
  onReorderClips,
  onAddTransition,
  onRemoveTransition,
  onUpdateClipDuration,
  onUpdateTransitionType,
  onUpdateTransitionDuration,
  onComposeAndPreview,
  onClearTimeline,
}: TimelineEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragFromIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragFromIndex !== null && dragOverIndex !== null && dragFromIndex !== dragOverIndex) {
      onReorderClips(dragFromIndex, dragOverIndex);
    }
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, [dragFromIndex, dragOverIndex, onReorderClips]);

  const handleAddTransition = useCallback(
    (afterClipId: string) => {
      onAddTransition(afterClipId, "fade");
    },
    [onAddTransition],
  );

  // Get clip index from items array
  const getClipIndex = useCallback(
    (clipId: string) => clips.findIndex((c) => c.id === clipId),
    [clips],
  );

  const totalSeconds = (totalDurationFrames / 30).toFixed(1);

  return (
    <div className="flex flex-col border-t border-border bg-background">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-dim bg-background-elevated/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Timeline</span>
            {isCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          {hasClips && (
            <div className="flex items-center gap-3 ml-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                {clips.length} clip{clips.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalSeconds}s ({totalDurationFrames}f)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddClip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border
              text-foreground bg-background-elevated
              hover:border-primary hover:bg-primary/10 hover:text-primary
              transition-all duration-200"
          >
            <Plus className="w-3 h-3" />
            Add Clip
          </button>

          {hasClips && (
            <>
              <button
                onClick={onComposeAndPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                  bg-primary text-primary-foreground
                  hover:bg-primary-hover
                  shadow-[0_0_12px_rgba(168,85,247,0.25)]
                  transition-all duration-200"
              >
                <Play className="w-3 h-3" />
                Compose & Preview
              </button>
              <button
                onClick={onClearTimeline}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-md
                  text-muted-foreground hover:text-destructive hover:bg-destructive/10
                  transition-colors"
                title="Clear timeline"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Timeline track */}
      {!isCollapsed && (
        <div className="group/timeline px-4 py-3 overflow-x-auto overflow-y-hidden">
          {hasClips ? (
            <div className="flex items-stretch gap-0 min-h-[72px]">
              {items.map((item) => {
                if (item.kind === "clip") {
                  const clipIdx = getClipIndex(item.data.id);
                  const isLast = clipIdx === clips.length - 1;
                  // Check if there's already a transition after this clip
                  const hasTransitionAfter = items.some(
                    (itm, i) =>
                      itm.kind === "transition" &&
                      items[i - 1]?.kind === "clip" &&
                      (items[i - 1] as { kind: "clip"; data: TimelineClip })
                        .data.id === item.data.id,
                  );

                  return (
                    <div key={item.data.id} className="contents">
                      <TimelineClipItem
                        clip={item.data}
                        index={clipIdx}
                        isSelected={selectedClipId === item.data.id}
                        onSelect={() => setSelectedClipId(item.data.id)}
                        onRemove={onRemoveClip}
                        onDurationChange={onUpdateClipDuration}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                      />
                      {/* Show add-transition button if no transition exists and not last clip */}
                      {!isLast && !hasTransitionAfter && (
                        <AddTransitionButton
                          afterClipId={item.data.id}
                          onAdd={handleAddTransition}
                        />
                      )}
                    </div>
                  );
                }

                if (item.kind === "transition") {
                  return (
                    <TimelineTransitionItem
                      key={item.data.id}
                      transition={item.data}
                      onRemove={onRemoveTransition}
                      onTypeChange={onUpdateTransitionType}
                      onDurationChange={onUpdateTransitionDuration}
                    />
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[72px] rounded-lg border border-dashed border-border text-sm text-muted-foreground-dim">
              <div className="flex flex-col items-center gap-1.5">
                <Film className="w-5 h-5 opacity-40" />
                <span>
                  Generate animations, then click{" "}
                  <strong className="text-muted-foreground">Add Clip</strong>{" "}
                  to build your timeline
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Duration ruler (subtle) */}
      {!isCollapsed && hasClips && (
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/30 transition-all duration-300"
              style={{
                width: `${Math.min(100, (totalDurationFrames / 900) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
