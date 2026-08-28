"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  TimelineClip,
  TimelineTransition,
  TimelineItem,
  TransitionType,
} from "@/types/timeline";
import {
  CLIP_COLORS,
  generateTimelineId,
} from "@/types/timeline";

interface UseTimelineReturn {
  /** Ordered list of timeline items (clips interleaved with transitions) */
  items: TimelineItem[];
  /** Just the clips in order */
  clips: TimelineClip[];
  /** Total duration of the composed timeline in frames */
  totalDurationFrames: number;
  /** Whether the timeline has any clips */
  hasClips: boolean;
  /** Add a clip from generated code */
  addClip: (label: string, code: string, durationFrames?: number) => void;
  /** Remove a clip and its adjacent transitions */
  removeClip: (clipId: string) => void;
  /** Reorder clips via drag-and-drop indices */
  reorderClips: (fromIndex: number, toIndex: number) => void;
  /** Insert a transition after a given clip */
  addTransition: (afterClipId: string, type: TransitionType) => void;
  /** Remove a transition */
  removeTransition: (transitionId: string) => void;
  /** Update a clip's duration */
  updateClipDuration: (clipId: string, frames: number) => void;
  /** Update a transition's type */
  updateTransitionType: (transitionId: string, type: TransitionType) => void;
  /** Update a transition's duration */
  updateTransitionDuration: (transitionId: string, frames: number) => void;
  /** Compose all clips + transitions into a single Remotion TransitionSeries component */
  composeRemotionCode: () => string;
  /** Clear the entire timeline */
  clearTimeline: () => void;
}

export function useTimeline(): UseTimelineReturn {
  const [clips, setClips] = useState<TimelineClip[]>([]);
  // Map from clip ID → transition AFTER that clip
  const [transitions, setTransitions] = useState<
    Map<string, TimelineTransition>
  >(new Map());

  const addClip = useCallback(
    (label: string, code: string, durationFrames = 150) => {
      const colorIndex =
        (clips.length) % CLIP_COLORS.length;
      const newClip: TimelineClip = {
        id: generateTimelineId(),
        label: label.length > 32 ? `${label.slice(0, 30)}…` : label,
        code,
        durationFrames,
        color: CLIP_COLORS[colorIndex],
      };
      setClips((prev) => [...prev, newClip]);
    },
    [clips.length],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      setClips((prev) => {
        const idx = prev.findIndex((c) => c.id === clipId);
        if (idx === -1) return prev;
        const next = prev.filter((c) => c.id !== clipId);
        return next;
      });
      // Remove any transition associated with this clip
      setTransitions((prev) => {
        const next = new Map(prev);
        next.delete(clipId);
        // Also remove any transition that pointed to this clip from a previous clip
        for (const key of Array.from(next.keys())) {
          // If the clip after `key` was the removed clip, remove that transition too
          const clipIdx = clips.findIndex((c) => c.id === key);
          if (clipIdx >= 0 && clips[clipIdx + 1]?.id === clipId) {
            next.delete(key);
          }
        }
        return next;
      });
    },
    [clips],
  );

  const reorderClips = useCallback(
    (fromIndex: number, toIndex: number) => {
      setClips((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length
        ) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
      // Clear transitions on reorder since clip adjacency changed
      setTransitions(new Map());
    },
    [],
  );

  const addTransition = useCallback(
    (afterClipId: string, type: TransitionType) => {
      const newTransition: TimelineTransition = {
        id: generateTimelineId(),
        type,
        durationFrames: 15,
      };
      setTransitions((prev) => {
        const next = new Map(prev);
        next.set(afterClipId, newTransition);
        return next;
      });
    },
    [],
  );

  const removeTransition = useCallback((transitionId: string) => {
    setTransitions((prev) => {
      const next = new Map(prev);
      for (const [key, t] of Array.from(next.entries())) {
        if (t.id === transitionId) {
          next.delete(key);
          break;
        }
      }
      return next;
    });
  }, []);

  const updateClipDuration = useCallback(
    (clipId: string, frames: number) => {
      setClips((prev) =>
        prev.map((c) =>
          c.id === clipId
            ? { ...c, durationFrames: Math.max(30, frames) }
            : c,
        ),
      );
    },
    [],
  );

  const updateTransitionType = useCallback(
    (transitionId: string, type: TransitionType) => {
      setTransitions((prev) => {
        const next = new Map(prev);
        for (const [key, t] of Array.from(next.entries())) {
          if (t.id === transitionId) {
            next.set(key, { ...t, type });
            break;
          }
        }
        return next;
      });
    },
    [],
  );

  const updateTransitionDuration = useCallback(
    (transitionId: string, frames: number) => {
      setTransitions((prev) => {
        const next = new Map(prev);
        for (const [key, t] of Array.from(next.entries())) {
          if (t.id === transitionId) {
            next.set(key, { ...t, durationFrames: Math.max(5, Math.min(60, frames)) });
            break;
          }
        }
        return next;
      });
    },
    [],
  );

  const clearTimeline = useCallback(() => {
    setClips([]);
    setTransitions(new Map());
  }, []);

  // Build the interleaved items list
  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];
    clips.forEach((clip, idx) => {
      result.push({ kind: "clip", data: clip });
      const trans = transitions.get(clip.id);
      if (trans && idx < clips.length - 1) {
        result.push({ kind: "transition", data: trans });
      }
    });
    return result;
  }, [clips, transitions]);

  const totalDurationFrames = useMemo(() => {
    let total = 0;
    for (const clip of clips) {
      total += clip.durationFrames;
    }
    // Subtract transition overlap durations
    for (const [, trans] of Array.from(transitions.entries())) {
      total -= trans.durationFrames;
    }
    return Math.max(0, total);
  }, [clips, transitions]);

  /**
   * Compose all timeline clips into a single Remotion component using TransitionSeries.
   * Each clip's code is compiled independently by the existing compiler, so here we
   * generate wrapper code that references them via Sequence.
   */
  const composeRemotionCode = useCallback((): string => {
    if (clips.length === 0) return "";
    if (clips.length === 1) return clips[0].code;

    // Build a TransitionSeries component
    const clipComponents = clips.map((clip, idx) => {
      // Extract the component name or create an inline one
      const compName = `Clip${idx}`;
      return { clip, compName };
    });

    // Generate import-like section for each clip as an inline component
    const inlineComponents = clipComponents
      .map(({ clip, compName }) => {
        // Extract body from the clip code (strip imports and export wrapper)
        // We wrap each clip in its own component
        return `const ${compName} = () => {
${extractComponentBodyForComposition(clip.code)}
};`;
      })
      .join("\n\n");

    // Build TransitionSeries JSX
    const seriesItems: string[] = [];
    clips.forEach((clip, idx) => {
      const compName = `Clip${idx}`;
      seriesItems.push(
        `      <TransitionSeries.Sequence durationInFrames={${clip.durationFrames}}>
        <${compName} />
      </TransitionSeries.Sequence>`,
      );
      const trans = transitions.get(clip.id);
      if (trans && idx < clips.length - 1) {
        const transFunc = trans.type === "clockWipe" ? "clockWipe" : trans.type;
        seriesItems.push(
          `      <TransitionSeries.Transition
        presentation={${transFunc}()}
        timing={linearTiming({ durationInFrames: ${trans.durationFrames} })}
      />`,
        );
      }
    });

    return `import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

${inlineComponents}

export const MyAnimation = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
${seriesItems.join("\n")}
      </TransitionSeries>
    </AbsoluteFill>
  );
};`;
  }, [clips, transitions]);

  return {
    items,
    clips,
    totalDurationFrames,
    hasClips: clips.length > 0,
    addClip,
    removeClip,
    reorderClips,
    addTransition,
    removeTransition,
    updateClipDuration,
    updateTransitionType,
    updateTransitionDuration,
    composeRemotionCode,
    clearTimeline,
  };
}

/**
 * Extract the component body from clip code for inline composition.
 * Strips imports and the export wrapper, leaving just the function body.
 */
function extractComponentBodyForComposition(code: string): string {
  let cleaned = code;

  // Remove all import statements
  cleaned = cleaned.replace(
    /import\s+type\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g,
    "",
  );
  cleaned = cleaned.replace(
    /import\s+\w+\s*,\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g,
    "",
  );
  cleaned = cleaned.replace(
    /import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g,
    "",
  );
  cleaned = cleaned.replace(
    /import\s+\*\s+as\s+\w+\s+from\s*["'][^"']+["'];?/g,
    "",
  );
  cleaned = cleaned.replace(/import\s+\w+\s+from\s*["'][^"']+["'];?/g, "");
  cleaned = cleaned.replace(/import\s*["'][^"']+["'];?/g, "");

  cleaned = cleaned.trim();

  // Extract body from "export const MyAnimation = () => { ... };"
  const match = cleaned.match(
    /^([\s\S]*?)export\s+const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\{([\s\S]*)\};?\s*$/,
  );

  if (match) {
    const helpers = match[1].trim();
    const body = match[2].trim();
    return helpers ? `${helpers}\n\n${body}` : body;
  }

  return cleaned;
}
