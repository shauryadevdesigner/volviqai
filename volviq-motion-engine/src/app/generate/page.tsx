"use client";

import { Loader2 } from "lucide-react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { ChatSidebar, type ChatSidebarRef } from "../../components/ChatSidebar";
import { CodeEditor } from "../../components/CodeEditor";
import { TabPanel } from "../../components/TabPanel";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useAutoCorrection } from "../../hooks/useAutoCorrection";
import { useConversationState } from "../../hooks/useConversationState";
import type {
  AssistantMetadata,
  EditOperation,
  ErrorCorrectionContext,
} from "../../types/conversation";
import {
  MIN_DURATION_FRAMES,
  resolveDurationInFrames,
} from "@/lib/video-duration";
import type { UserFacingGenerationError } from "@/lib/generation-errors";
import type { GenerationErrorType, StreamPhase } from "../../types/generation";
import { useTimeline } from "@/hooks/useTimeline";
import { TimelineEditor } from "@/components/TimelineEditor";

// Additional imports for Dashboard Sidebar integration
import { useRequireAuth } from "@/components/providers/AuthProvider";
import {
  DashboardSidebar,
  DashboardSidebarMobileToggle,
} from "@/components/dashboard/DashboardSidebar";
import { useWorkspaceProjects } from "@/hooks/useWorkspaceProjects";

const MAX_CORRECTION_ATTEMPTS = 3;

function GeneratePageContent() {
  const { profile, loading, logout } = useRequireAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { projects } = useWorkspaceProjects();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const projectId = searchParams.get("projectId") || "";

  // If we have an initial prompt from URL, start in streaming state
  // so syntax highlighting is disabled from the beginning
  const willAutoStart = Boolean(initialPrompt);

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

  // Self-correction state
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionContext | null>(null);

  // Conversation state for follow-up edits
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

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    code,
    Component,
    error: compilationError,
    isCompiling,
    setCode,
    compileCode,
  } = useAnimationState(examples[0]?.code || "");

  // Runtime errors from the Player (e.g., "cannot access variable before initialization")
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Combined error for display - either compilation or runtime error
  const codeError = compilationError || runtimeError;

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const codeRef = useRef(code);
  const lastGenerationPromptRef = useRef("");
  const chatSidebarRef = useRef<ChatSidebarRef>(null);

  // Auto-correction hook - use combined code error (compilation + runtime)
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
        // Get attached images from the last user message to include in retry
        const lastImages = getLastUserAttachedImages();
        setTimeout(() => {
          // Use silent mode to avoid showing retry as a user message
          // Include images from the last user message so image-based requests can be retried
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

  // Sync refs
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;

    // Compile when streaming ends - mark as AI change
    if (wasStreaming && !isStreaming) {
      markAsAiGenerated();
      compileCode(codeRef.current);
    }
  }, [isStreaming, compileCode, markAsAiGenerated]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setHasGeneratedOnce(true);

      // Mark as manual edit if not streaming (user typing)
      if (!isStreamingRef.current) {
        markManualEdit(newCode);
        markAsUserEdited();
      }

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip compilation while streaming - will compile when streaming ends
      if (isStreamingRef.current) {
        return;
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        compileCode(newCode);
      }, 500);
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

  // Handle message sent for history
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

  // Handle generation complete for history
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
      markAsAiGenerated();
    },
    [addAssistantMessage, markAsAiGenerated],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    // Clear errors when starting a new generation
    if (streaming) {
      setGenerationError(null);
      setRuntimeError(null);
    }
  }, []);

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

  // Handle runtime errors from the Player (e.g., "cannot access variable before initialization")
  const handleRuntimeError = useCallback((errorMessage: string) => {
    // Set runtime error - this will be combined with compilation errors via codeError
    // The useAutoCorrection hook will pick this up via the compilationError prop
    setRuntimeError(errorMessage);
  }, []);

  // Auto-trigger generation if prompt came from URL
  useEffect(() => {
    if (initialPrompt && !hasAutoStarted && chatSidebarRef.current) {
      setHasAutoStarted(true);
      // Check for initial attached images from sessionStorage
      const storedImagesJson = sessionStorage.getItem("initialAttachedImages");
      let storedImages: string[] | undefined;
      if (storedImagesJson) {
        try {
          storedImages = JSON.parse(storedImagesJson);
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem("initialAttachedImages");
      }
      setTimeout(() => {
        chatSidebarRef.current?.triggerGeneration({
          attachedImages: storedImages,
        });
      }, 100);
    }
  }, [initialPrompt, hasAutoStarted]);

  // Load project by ID if provided
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const proj = projects.find((p) => p.id === projectId);
      if (proj) {
        setCode(proj.code);
        setPrompt(proj.prompt);
        compileCode(proj.code);
        setHasGeneratedOnce(true);
      }
    }
  }, [projectId, projects, setCode, setPrompt, compileCode]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebarMobileToggle onClick={() => setMobileNavOpen(true)} />
      <DashboardSidebar
        profile={profile}
        onLogout={logout}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
        onSelectTemplate={(tPrompt) => setPrompt(tPrompt)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-[1000px]:flex-row min-w-0 overflow-hidden mt-12 md:mt-0">
          {/* Chat History Sidebar */}
          <ChatSidebar
            ref={chatSidebarRef}
            messages={messages}
            pendingMessage={pendingMessage}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            hasManualEdits={hasManualEdits}
            // Generation props for embedded input
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
            // Frame capture props
            Component={Component}
            fps={fps}
            durationInFrames={durationInFrames}
            currentFrame={currentFrame}
          />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 pr-12 pb-8 overflow-hidden">
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
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
    </div>
  );
}

const GeneratePage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratePageContent />
    </Suspense>
  );
};

export default GeneratePage;
