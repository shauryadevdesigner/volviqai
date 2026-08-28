"use client";

import { X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { TimelineTransition, TransitionType } from "@/types/timeline";
import { TRANSITION_OPTIONS } from "@/types/timeline";

interface TimelineTransitionItemProps {
  transition: TimelineTransition;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: TransitionType) => void;
  onDurationChange: (id: string, frames: number) => void;
}

export function TimelineTransitionItem({
  transition,
  onRemove,
  onTypeChange,
  onDurationChange,
}: TimelineTransitionItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = TRANSITION_OPTIONS.find(
    (o) => o.value === transition.type,
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center mx-0.5 group">
      {/* Diamond connector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`
            relative flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[10px] font-medium
            transition-all duration-200
            ${
              showDropdown
                ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "border-border bg-background-elevated text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
            }
          `}
        >
          {/* Decorative diamond icon */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="flex-shrink-0"
          >
            <path
              d="M5 0L10 5L5 10L0 5Z"
              fill="currentColor"
              opacity={0.6}
            />
          </svg>
          <span>{currentOption?.label ?? transition.type}</span>
          <ChevronDown className="w-2.5 h-2.5 opacity-50" />
        </button>

        {/* Remove button */}
        <button
          onClick={() => onRemove(transition.id)}
          className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded-full bg-background-elevated border border-border hover:bg-destructive/20 hover:border-destructive/40 transition-all z-10"
        >
          <X className="w-2.5 h-2.5 text-muted-foreground hover:text-destructive" />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[140px] rounded-lg border border-border bg-background-elevated shadow-xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Transition type options */}
            <div className="p-1">
              {TRANSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onTypeChange(transition.id, opt.value);
                    setShowDropdown(false);
                  }}
                  className={`
                    w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors
                    ${
                      transition.type === opt.value
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-accent"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Duration slider */}
            <div className="border-t border-border p-2.5">
              <label className="text-[10px] text-muted-foreground mb-1 block">
                Duration: {transition.durationFrames}f (
                {(transition.durationFrames / 30).toFixed(1)}s)
              </label>
              <input
                type="range"
                min={5}
                max={60}
                value={transition.durationFrames}
                onChange={(e) =>
                  onDurationChange(transition.id, parseInt(e.target.value))
                }
                className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(168,85,247,0.4)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
