"use client";

import { useState, useEffect, useCallback } from "react";

export interface WorkspaceProject {
  id: string;
  name: string;
  code: string;
  prompt: string;
  lastUpdated: number;
  status: "Draft" | "Ready" | "Rendering" | "Completed" | "Failed";
  conversationId?: string;
}

const PROJECTS_STORAGE_KEY = "volviq-workspace-projects";

export function useWorkspaceProjects() {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (raw) {
        setProjects(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to load workspace projects", e);
    }
  }, []);

  const saveProjects = useCallback((newProjects: WorkspaceProject[]) => {
    setProjects(newProjects);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
    }
  }, []);

  const addProject = useCallback((project: Omit<WorkspaceProject, "id" | "lastUpdated">) => {
    const newProj: WorkspaceProject = {
      ...project,
      id: `proj-${Math.random().toString(36).substring(2, 9)}`,
      lastUpdated: Date.now(),
    };
    const updated = [newProj, ...projects];
    saveProjects(updated);
    return newProj;
  }, [projects, saveProjects]);

  const updateProject = useCallback((id: string, updates: Partial<WorkspaceProject>) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...updates, lastUpdated: Date.now() } : p
    );
    saveProjects(updated);
  }, [projects, saveProjects]);

  const deleteProject = useCallback((id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
  }, [projects, saveProjects]);

  const duplicateProject = useCallback((id: string) => {
    const original = projects.find((p) => p.id === id);
    if (!original) return;
    const duplicated: WorkspaceProject = {
      ...original,
      id: `proj-${Math.random().toString(36).substring(2, 9)}`,
      name: `${original.name} (Copy)`,
      lastUpdated: Date.now(),
    };
    const updated = [duplicated, ...projects];
    saveProjects(updated);
    return duplicated;
  }, [projects, saveProjects]);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject,
  };
}
