import React from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

export const ProgressBar: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const percentage = Math.round(progress * 100);

  return (
    <GlassPanel shape="lg" className="flex flex-col gap-2 w-full px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Rendering...</span>
        <span className="font-medium text-white">{percentage}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
        <div
          className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-white/70 to-white shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </GlassPanel>
  );
};
