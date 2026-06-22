"use client";

import { X, GripVertical } from "lucide-react";
import type { TimelineClip } from "@/types/timeline";

interface TimelineClipItemProps {
  clip: TimelineClip;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove: (id: string) => void;
  onDurationChange: (id: string, frames: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

export function TimelineClipItem({
  clip,
  index,
  isSelected,
  onSelect,
  onRemove,
  onDurationChange,
  onDragStart,
  onDragOver,
  onDragEnd,
}: TimelineClipItemProps) {
  const widthPx = Math.max(80, Math.min(320, clip.durationFrames * 1.2));
  const durationSec = (clip.durationFrames / 30).toFixed(1);

  return (
    <div
      className="group relative flex-shrink-0 select-none"
      style={{ width: widthPx }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(index);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
    >
      <div
        className={`
          relative h-full rounded-lg border overflow-hidden cursor-pointer
          transition-all duration-200 ease-out
          ${
            isSelected
              ? "border-primary shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]"
              : "border-border hover:border-[#555] hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
          }
        `}
        style={{
          background: `linear-gradient(135deg, ${clip.color}15, ${clip.color}08, var(--background-elevated))`,
        }}
      >
        {/* Color accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: clip.color }}
        />

        {/* Drag handle */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="pl-7 pr-7 py-2.5 flex flex-col gap-1 h-full justify-center">
          <span className="text-xs font-medium text-foreground truncate leading-tight">
            {clip.label}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={clip.durationFrames}
              onChange={(e) =>
                onDurationChange(clip.id, parseInt(e.target.value) || 30)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-12 bg-transparent text-[10px] text-muted-foreground border border-transparent hover:border-border focus:border-primary rounded px-1 py-0.5 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={30}
              max={900}
            />
            <span className="text-[10px] text-muted-foreground-dim">
              {durationSec}s
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(clip.id);
          }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 transition-all"
        >
          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </button>

        {/* Clip index badge */}
        <div
          className="absolute bottom-1.5 right-1.5 text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center"
          style={{
            backgroundColor: `${clip.color}30`,
            color: clip.color,
          }}
        >
          {index + 1}
        </div>
      </div>
    </div>
  );
}
