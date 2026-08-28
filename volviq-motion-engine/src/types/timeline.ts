/** Timeline data model for multi-clip ad composition */

export type TransitionType = "fade" | "slide" | "wipe" | "flip" | "clockWipe";

export interface TimelineClip {
  id: string;
  label: string;
  /** Raw Remotion component source code for this clip */
  code: string;
  /** Duration of this clip in frames */
  durationFrames: number;
  /** Accent color for the clip block in the timeline UI */
  color: string;
}

export interface TimelineTransition {
  id: string;
  type: TransitionType;
  /** Duration of the transition overlap in frames */
  durationFrames: number;
}

export type TimelineItem =
  | { kind: "clip"; data: TimelineClip }
  | { kind: "transition"; data: TimelineTransition };

export const TRANSITION_OPTIONS: {
  value: TransitionType;
  label: string;
}[] = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "wipe", label: "Wipe" },
  { value: "flip", label: "Flip" },
  { value: "clockWipe", label: "Clock Wipe" },
];

/** Preset accent colors for timeline clips */
export const CLIP_COLORS = [
  "#a855f7", // purple (primary)
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // violet
];

/** Generate a unique ID */
export function generateTimelineId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
