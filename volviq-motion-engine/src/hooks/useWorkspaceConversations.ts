"use client";

import { useCallback, useEffect, useState } from "react";

export interface WorkspaceConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
  pinned?: boolean;
}

const STORAGE_KEY = "volviq-workspace-conversations";

function loadConversations(): WorkspaceConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkspaceConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(conversations: WorkspaceConversation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function useWorkspaceConversations() {
  const [conversations, setConversations] = useState<WorkspaceConversation[]>(
    [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const upsertConversation = useCallback(
    (id: string, title: string, preview?: string) => {
      setConversations((prev) => {
        const now = Date.now();
        const existing = prev.find((c) => c.id === id);
        const next: WorkspaceConversation[] = existing
          ? prev.map((c) =>
              c.id === id
                ? { ...c, title, preview, updatedAt: now }
                : c,
            )
          : [
              {
                id,
                title,
                preview,
                createdAt: now,
                updatedAt: now,
                pinned: false,
              },
              ...prev,
            ];
        persist(next);
        return next;
      });
      setActiveId(id);
    },
    [],
  );

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persist(next);
      return next;
    });
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
      );
      persist(next);
      return next;
    });
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c,
      );
      persist(next);
      return next;
    });
  }, []);

  const filtered = conversations
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  return {
    conversations: filtered,
    activeId,
    setActiveId,
    search,
    setSearch,
    upsertConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
  };
}
