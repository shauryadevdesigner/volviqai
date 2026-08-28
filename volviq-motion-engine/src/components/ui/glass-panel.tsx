import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "pill" for fully rounded (badges, chips, inline status), "lg" for cards/overlays */
  shape?: "pill" | "lg" | "md";
  /** adds a slow drifting light sheen — use sparingly, e.g. one panel per screen */
  sheen?: boolean;
}

const shapeClass: Record<NonNullable<GlassPanelProps["shape"]>, string> = {
  pill: "glass-pill",
  lg: "rounded-2xl",
  md: "rounded-xl",
};

/**
 * Frosted, translucent "liquid glass" surface (iOS 26 style):
 * blurred backdrop, soft specular rim on the top edge, subtle depth shadow.
 * Works best layered over busy/animated backgrounds or media.
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, shape = "lg", sheen = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("glass", shapeClass[shape], sheen && "glass-sheen", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
