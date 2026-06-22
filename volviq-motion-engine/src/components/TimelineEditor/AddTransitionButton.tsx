"use client";

import { Plus } from "lucide-react";

interface AddTransitionButtonProps {
  afterClipId: string;
  onAdd: (afterClipId: string) => void;
}

export function AddTransitionButton({
  afterClipId,
  onAdd,
}: AddTransitionButtonProps) {
  return (
    <button
      onClick={() => onAdd(afterClipId)}
      className="
        flex-shrink-0 flex items-center justify-center
        w-6 h-6 mx-0.5
        rounded-full border border-dashed border-border
        text-muted-foreground-dim
        hover:border-primary hover:text-primary hover:bg-primary/10
        hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]
        transition-all duration-200
        opacity-0 group-hover/timeline:opacity-100
        focus:opacity-100
      "
      title="Add transition"
    >
      <Plus className="w-3 h-3" />
    </button>
  );
}
