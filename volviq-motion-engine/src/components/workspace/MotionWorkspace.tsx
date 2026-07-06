"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AnimationPlayer } from "@/components/AnimationPlayer";
import { ChatSidebar, type ChatSidebarRef } from "@/components/ChatSidebar";
import { CodeEditor } from "@/components/CodeEditor";
import { TabPanel } from "@/components/TabPanel";
import { TimelineEditor } from "@/components/TimelineEditor";
import { examples } from "@/examples/code";
import { useAnimationState } from "@/hooks/useAnimationState";
import { useAutoCorrection } from "@/hooks/useAutoCorrection";
import { useConversationState } from "@/hooks/useConversationState";
import { useTimeline } from "@/hooks/useTimeline";
import { useWorkspaceConversations } from "@/hooks/useWorkspaceConversations";
import type {
  AssistantMetadata,
  EditOperation,
  ErrorCorrectionContext,
} from "@/types/conversation";
import {
  MIN_DURATION_FRAMES,
  resolveDurationInFrames,
} from "@/lib/video-duration";
import type { UserFacingGenerationError } from "@/lib/generation-errors";
import type { GenerationErrorType, StreamPhase } from "@/types/generation";

const MAX_CORRECTION_ATTEMPTS = 3;

export interface MotionWorkspaceRef {
  triggerGeneration: (options?: {
    silent?: boolean;
    attachedImages?: string[];
  }) => void;
  setPrompt: (prompt: string) => void;
}

interface MotionWorkspaceProps {
  initialPrompt?: string;
  autoStart?: boolean;
  accessToken?: string | null;
  compact?: boolean;
  onGenerationComplete?: () => void;
}

export const MotionWorkspace = forwardRef<MotionWorkspaceRef, MotionWorkspaceProps>(
  function MotionWorkspace(
    {
      initialPrompt = "",
      autoStart = false,
      accessToken,
      compact = false,
      onGenerationComplete,
    },
    ref,
  ) {
  const willAutoStart = Boolean(autoStart && initialPrompt);

  const [durationInFrames, setDurationInFrames] = useState(
    Math.max(examples[0]?.durationInFrames || MIN_DURATION_FRAMES, MIN_DURATION_FRAMES),
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isStreaming, setIsStreaming] = useState(willAutoStart);
  const [streamPhase, setStreamPhase] = useState<StreamPhase>(
    willAutoStart ? "reasoning" : "idle",
  );
  const [prompt, setPrompt] = useState(initialPrompt);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    type: GenerationErrorType;
    failedEdit?: EditOperation;
    userError?: UserFacingGenerationError;
  } | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState("");
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionContext | null>(null);
  // Keep chat sidebar visible — compact mode only tightens layout, not hide chat
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { upsertConversation } = useWorkspaceConversations();

  const {
    messages,
    hasManualEdits,
    pendingMessage,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    markManualEdit,
    getFullContext,
    getPreviouslyUsedSkills,
    getLastUserAttachedImages,
    setPendingMessage,
    clearPendingMessage,
    isFirstGeneration,
  } = useConversationState();

  const {
    code,
    Component,
    error: compilationError,
    isCompiling,
    setCode,
    compileCode,
  } = useAnimationState(examples[0]?.code || "");

  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const codeError = compilationError || runtimeError;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const lastGenerationPromptRef = useRef("");
  const conversationIdRef = useRef(`conv-${Date.now()}`);
  const chatSidebarRef = useRef<ChatSidebarRef | null>(null);
  const [chatSidebarLoaded, setChatSidebarLoaded] = useState(false);

  const setChatSidebar = useCallback((instance: ChatSidebarRef | null) => {
    chatSidebarRef.current = instance;
    setChatSidebarLoaded(Boolean(instance));
  }, []);

  useImperativeHandle(ref, () => ({
    triggerGeneration: (opts) =>
      chatSidebarRef.current?.triggerGeneration(opts),
    setPrompt: (p) => setPrompt(p),
  }));

  const { markAsAiGenerated, markAsUserEdited } = useAutoCorrection({
    maxAttempts: MAX_CORRECTION_ATTEMPTS,
    compilationError: codeError,
    generationError,
    isStreaming,
    isCompiling,
    hasGeneratedOnce,
    code,
    errorCorrection,
    lastPrompt: lastFailedPrompt,
    onTriggerCorrection: useCallback(
      (correctionPrompt: string, context: ErrorCorrectionContext) => {
        setErrorCorrection(context);
        setPrompt(correctionPrompt);
        const lastImages = getLastUserAttachedImages();
        setTimeout(() => {
          chatSidebarRef.current?.triggerGeneration({
            silent: true,
            attachedImages: lastImages,
          });
        }, 100);
      },
      [getLastUserAttachedImages],
    ),
    onAddErrorMessage: addErrorMessage,
    onClearGenerationError: useCallback(() => setGenerationError(null), []),
    onClearErrorCorrection: useCallback(() => setErrorCorrection(null), []),
  });

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;
    if (wasStreaming && !isStreaming) {
      markAsAiGenerated();
      compileCode(code);
    }
  }, [isStreaming, code, compileCode, markAsAiGenerated]);

  const lastImages = getLastUserAttachedImages();
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__userImages = lastImages || [];
    }
  }, [lastImages]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setHasGeneratedOnce(true);
      if (!isStreamingRef.current) {
        markManualEdit(newCode);
        markAsUserEdited();
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (isStreamingRef.current) return;
      debounceRef.current = setTimeout(() => compileCode(newCode), 500);
    },
    [setCode, compileCode, markManualEdit, markAsUserEdited],
  );

  const timeline = useTimeline();

  const handleAddClipToTimeline = useCallback(() => {
    if (!code.trim()) return;
    const label = lastGenerationPromptRef.current || "Clip";
    timeline.addClip(label, code, durationInFrames);
  }, [code, durationInFrames, timeline]);

  const handleComposeAndPreview = useCallback(() => {
    const composedCode = timeline.composeRemotionCode();
    if (composedCode) {
      handleCodeChange(composedCode);
      setDurationInFrames(timeline.totalDurationFrames);
    }
  }, [timeline, handleCodeChange, setDurationInFrames]);

  const handleMessageSent = useCallback(
    (promptText: string, attachedImages?: string[]) => {
      lastGenerationPromptRef.current = promptText;
      setLastFailedPrompt(promptText);
      addUserMessage(promptText, attachedImages);
      // Reset error correction state for fresh user attempts
      setErrorCorrection(null);
    },
    [addUserMessage],
  );

  const handleGenerationComplete = useCallback(
    (generatedCode: string, summary?: string, metadata?: AssistantMetadata) => {
      const content =
        summary || "Generated your animation, any follow up edits?";
      addAssistantMessage(content, generatedCode, metadata);
      setDurationInFrames((prev) =>
        resolveDurationInFrames({
          prompt: lastGenerationPromptRef.current,
          explicit: prev,
        }),
      );
      const title =
        lastGenerationPromptRef.current.slice(0, 48) ||
        "Untitled generation";
      upsertConversation(
        conversationIdRef.current,
        title,
        lastGenerationPromptRef.current.slice(0, 120),
      );
      markAsAiGenerated();
      onGenerationComplete?.();
    },
    [addAssistantMessage, markAsAiGenerated, onGenerationComplete, upsertConversation],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);

    // Clear any existing safety timeout
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
      streamingTimeoutRef.current = null;
    }

    if (streaming) {
      setGenerationError(null);
      setRuntimeError(null);

      // Safety timeout: force-reset isStreaming after 600s to prevent permanently stuck spinner
      streamingTimeoutRef.current = setTimeout(() => {
        console.warn("[Safety] Streaming timeout reached (600s). Force-resetting isStreaming to false.");
        setIsStreaming(false);
        // Abort the active generation request
        if (chatSidebarRef.current?.abortActiveRequest) {
          chatSidebarRef.current.abortActiveRequest();
        }
        setGenerationError({
          message: "Generation timed out. The request took longer than 10 minutes.",
          type: "api",
        });
        clearPendingMessage();
        streamingTimeoutRef.current = null;
      }, 600_000);
    }
  }, [clearPendingMessage]);

  const handleError = useCallback(
    (
      message: string,
      type: GenerationErrorType,
      failedEdit?: EditOperation,
      userError?: UserFacingGenerationError,
    ) => {
      setGenerationError({ message, type, failedEdit, userError });
    },
    [],
  );

  const handleRetryGeneration = useCallback(() => {
    if (!lastFailedPrompt.trim()) return;
    setGenerationError(null);
    setPrompt(lastFailedPrompt);
    setTimeout(() => {
      chatSidebarRef.current?.triggerGeneration({ silent: true });
    }, 50);
  }, [lastFailedPrompt]);

  const handleRuntimeError = useCallback((errorMessage: string) => {
    setRuntimeError(errorMessage);
  }, []);

  useEffect(() => {
    if (initialPrompt && autoStart && !hasAutoStarted && chatSidebarLoaded && chatSidebarRef.current) {
      setHasAutoStarted(true);
      setTimeout(() => {
        chatSidebarRef.current?.triggerGeneration();
      }, 100);
    }
  }, [initialPrompt, autoStart, hasAutoStarted, chatSidebarLoaded]);

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden min-[1000px]:flex-row ${compact ? "" : ""}`}
    >
      <ChatSidebar
        ref={setChatSidebar}
        messages={messages}
        pendingMessage={pendingMessage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasManualEdits={hasManualEdits}
        onCodeGenerated={handleCodeChange}
        onStreamingChange={handleStreamingChange}
        onStreamPhaseChange={setStreamPhase}
        onError={handleError}
        prompt={prompt}
        onPromptChange={setPrompt}
        currentCode={code}
        conversationHistory={getFullContext()}
        previouslyUsedSkills={getPreviouslyUsedSkills()}
        isFollowUp={!isFirstGeneration}
        onMessageSent={handleMessageSent}
        onGenerationComplete={handleGenerationComplete}
        onErrorMessage={addErrorMessage}
        errorCorrection={errorCorrection ?? undefined}
        onPendingMessage={setPendingMessage}
        onClearPendingMessage={clearPendingMessage}
        generationError={generationError?.userError}
        onRetryGeneration={handleRetryGeneration}
        onDismissGenerationError={() => setGenerationError(null)}
        Component={Component}
        fps={fps}
        durationInFrames={durationInFrames}
        currentFrame={currentFrame}
        accessToken={accessToken}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden ${compact ? "pb-2 pr-2" : "pr-12 pb-8"}`}
      >
        <TabPanel
          codeContent={
            <CodeEditor
              code={hasGeneratedOnce && !generationError ? code : ""}
              onChange={handleCodeChange}
              isStreaming={isStreaming}
              streamPhase={streamPhase}
            />
          }
          previewContent={
            <AnimationPlayer
              Component={generationError ? null : Component}
              durationInFrames={durationInFrames}
              fps={fps}
              onDurationChange={setDurationInFrames}
              onFpsChange={setFps}
              isCompiling={isCompiling}
              isStreaming={isStreaming}
              error={generationError?.message || codeError}
              errorType={generationError?.type || "compilation"}
              code={code}
              onRuntimeError={handleRuntimeError}
              onFrameChange={setCurrentFrame}
              errorCorrection={errorCorrection ?? undefined}
            />
          }
          timelineContent={
            <TimelineEditor
              items={timeline.items}
              clips={timeline.clips}
              totalDurationFrames={timeline.totalDurationFrames}
              hasClips={timeline.hasClips}
              onAddClip={handleAddClipToTimeline}
              onRemoveClip={timeline.removeClip}
              onReorderClips={timeline.reorderClips}
              onAddTransition={timeline.addTransition}
              onRemoveTransition={timeline.removeTransition}
              onUpdateClipDuration={timeline.updateClipDuration}
              onUpdateTransitionType={timeline.updateTransitionType}
              onUpdateTransitionDuration={timeline.updateTransitionDuration}
              onComposeAndPreview={handleComposeAndPreview}
              onClearTimeline={timeline.clearTimeline}
            />
          }
        />
      </div>
    </div>
  );
},
);
