"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassSpinner } from "@/components/ui/glass-spinner";

interface StreamingOverlayProps {
  visible: boolean;
  message?: string;
}

export const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  visible,
  message = "Generating code...",
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/20">
      <GlassPanel
        shape="pill"
        sheen
        className="flex items-center gap-3 px-5 py-3"
      >
        <GlassSpinner />
        <span className="text-white text-sm font-sans tracking-wide">
          {message}
        </span>
      </GlassPanel>
    </div>
  );
};
