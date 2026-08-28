"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronUp,
  Clock,
  FolderOpen,
  Heart,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  User,
  CreditCard,
  Bell,
  Briefcase,
  Pencil,
  X,
  Pin,
  Copy,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getPlanLimit, getRemainingGenerations } from "@/lib/plans";
import { useWorkspaceConversations } from "@/hooks/useWorkspaceConversations";
import { useWorkspaceProjects } from "@/hooks/useWorkspaceProjects";
import type { UserProfile } from "@/types/profile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const WORKSPACE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "New Generation", icon: Sparkles },
  { href: "/dashboard/history", label: "My Projects", icon: FolderOpen },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "#brand-assets", label: "Brand Assets", icon: Palette },
  { href: "#brand-assets", label: "Media Library", icon: Image },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const CATEGORIZED_TEMPLATES = {
  "Product Ads": [
    { id: "luxury-product", title: "Luxury Product Ad", prompt: "Create a luxury product advertisement with elegant motion typography and soft lighting" },
    { id: "product-showcase", title: "Product Showcase", prompt: "Generate a sleek 3D-feeling product showcase with smooth rotation, slide-in details, and shadow effects" }
  ],
  "Video Ads": [
    { id: "motion-ad-20s", title: "20s Motion Graphic", prompt: "Generate a 20-second motion graphic ad with bold typography and dynamic transitions" },
    { id: "cinematic-promo", title: "Cinematic Promo", prompt: "Create a cinematic promotional video with slow fades, dramatic text presentation, and rich color overlays" }
  ],
  "UGC Ads": [
    { id: "ugc-testimonial", title: "UGC Testimonial", prompt: "Create a UGC-style customer testimonial layout with split-screen, speech bubble animations, and subtitle transitions" },
    { id: "tiktok-style", title: "TikTok Native UGC", prompt: "Generate a native TikTok-style ad with mobile UI overlay, raw text highlights, and bouncy reaction animations" }
  ],
  "Social Ads": [
    { id: "ig-reel-startup", title: "Startup Reel", prompt: "Create an Instagram reel for my startup with energetic text animations and brand colors" },
    { id: "yt-short", title: "YouTube Short", prompt: "Create a YouTube Short with hook text in the first 2 seconds and kinetic typography" }
  ],
  "Ecommerce Ads": [
    { id: "black-friday", title: "Black Friday Promo", prompt: "Generate a Black Friday promotion video with countdown and sale highlights" },
    { id: "flash-sale", title: "Flash Sale Alert", prompt: "Design an ecommerce flash sale alert with pulsing badge, discount tags, and shop now CTA" }
  ]
};

interface BrandAssets {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fontFamily: string;
  images: string[];
}

const DEFAULT_BRAND_ASSETS: BrandAssets = {
  colors: {
    primary: "#6366f1",
    secondary: "#4f46e5",
    background: "#09090b",
    text: "#fafafa",
  },
  fontFamily: "Inter, sans-serif",
  images: [],
};

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onLogout: () => void;
  onSelectTemplate?: (prompt: string) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function SidebarContent({
  profile,
  onLogout,
  onSelectTemplate,
  onNavigate,
}: DashboardSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Categorized templates expanded state
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Brand Assets state
  const [brandAssetsOpen, setBrandAssetsOpen] = useState(false);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>(DEFAULT_BRAND_ASSETS);

  // Projects state
  const {
    projects,
    updateProject,
    deleteProject,
    duplicateProject,
  } = useWorkspaceProjects();
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameProjectValue, setRenameProjectValue] = useState("");

  const {
    conversations,
    activeId,
    setActiveId,
    search,
    setSearch,
    deleteConversation,
    renameConversation,
    togglePinConversation,
  } = useWorkspaceConversations();

  const remaining = profile
    ? getRemainingGenerations(
        profile.plan,
        profile.generations_used_this_month,
      )
    : 0;
  const limit = profile ? getPlanLimit(profile.plan) : 3;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCollapse = localStorage.getItem("volviq-sidebar-collapsed");
      if (storedCollapse === "true") {
        setIsCollapsed(true);
      }
      const storedBrand = localStorage.getItem("volviq-brand-assets");
      if (storedBrand) {
        try {
          setBrandAssets(JSON.parse(storedBrand));
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const toggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("volviq-sidebar-collapsed", String(nextVal));
      window.dispatchEvent(new Event("sidebar-collapsed-change"));
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
  };

  const commitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameConversation(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }, [renamingId, renameValue, renameConversation]);

  const startRenameProject = (id: string, current: string) => {
    setRenamingProjectId(id);
    setRenameProjectValue(current);
  };

  const commitRenameProject = useCallback(() => {
    if (renamingProjectId && renameProjectValue.trim()) {
      updateProject(renamingProjectId, { name: renameProjectValue.trim() });
    }
    setRenamingProjectId(null);
  }, [renamingProjectId, renameProjectValue, updateProject]);

  const handleNavClick = (href: string, label: string, e: React.MouseEvent) => {
    if (href === "#brand-assets") {
      e.preventDefault();
      setBrandAssetsOpen(true);
    } else {
      onNavigate?.();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = { ...brandAssets, logo: base64 };
      setBrandAssets(updated);
      localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = {
        ...brandAssets,
        images: [...(brandAssets.images || []), base64],
      };
      setBrandAssets(updated);
      localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updatedImages = (brandAssets.images || []).filter((_, i) => i !== index);
    const updated = { ...brandAssets, images: updatedImages };
    setBrandAssets(updated);
    localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
  };

  const handleColorChange = (key: keyof BrandAssets["colors"], value: string) => {
    const updated = {
      ...brandAssets,
      colors: {
        ...brandAssets.colors,
        [key]: value,
      },
    };
    setBrandAssets(updated);
    localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
  };

  const handleFontChange = (font: string) => {
    const updated = { ...brandAssets, fontFamily: font };
    setBrandAssets(updated);
    localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
  };

  return (
    <>
      <div className={cn("border-b border-border p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={onNavigate}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
              V
            </div>
            <span className="font-semibold text-foreground">Volviq AI</span>
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-accent hidden md:block"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-0.5 p-3">
        {!isCollapsed && (
          <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground-dim">
            Workspace
          </p>
        )}
        {WORKSPACE_NAV.map(({ href, label, icon: Icon }) => {
          const isNewGen = label === "New Generation";
          const isActive = pathname === href && !isNewGen;

          const linkContent = (
            <Link
              href={href}
              onClick={(e) => handleNavClick(href, label, e)}
              className={cn(
                "flex items-center gap-3 rounded-lg transition-colors py-2",
                isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "px-3 text-sm",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={`${href}-${label}`}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={`${href}-${label}`}>{linkContent}</div>;
        })}
        
        {!isCollapsed && (
          <Link
            href="/dashboard/analytics"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/analytics"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        )}
      </nav>

      {/* Templates Section */}
      {!isCollapsed && (
        <div className="border-t border-border px-3 py-3">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground-dim">
            Templates
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {Object.entries(CATEGORIZED_TEMPLATES).map(([category, items]) => {
              const isExpanded = expandedCategory === category;
              return (
                <div key={category} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-1 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span>{category}</span>
                    <span className="text-[9px] text-muted-foreground-dim font-mono">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="pl-3 space-y-0.5 border-l border-border ml-3 mt-0.5">
                      {items.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onSelectTemplate?.(t.prompt);
                            onNavigate?.();
                          }}
                          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Plus className="h-2.5 w-2.5 shrink-0 text-primary" />
                          <span className="truncate">{t.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content flex area containing projects & conversations */}
      {!isCollapsed && (
        <div className="flex min-h-0 flex-1 flex-col border-t border-border mt-2">
          {/* Projects Section */}
          <div className="flex flex-col min-h-0 border-b border-border pb-2">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground-dim">
                Projects
              </p>
            </div>
            <div className="overflow-y-auto px-2 max-h-40">
              {projects.length === 0 ? (
                <p className="px-3 py-2 text-[11px] text-muted-foreground-dim">No projects yet</p>
              ) : (
                <ul className="space-y-0.5">
                  {projects.map((p) => {
                    const statusColors = {
                      Draft: "bg-amber-400",
                      Ready: "bg-emerald-500",
                      Rendering: "bg-sky-500 animate-pulse",
                      Completed: "bg-emerald-500",
                      Failed: "bg-rose-500",
                    };

                    return (
                      <li key={p.id}>
                        {renamingProjectId === p.id ? (
                          <input
                            className="w-full rounded border border-primary bg-input px-2 py-1 text-xs"
                            value={renameProjectValue}
                            onChange={(e) => setRenameProjectValue(e.target.value)}
                            onBlur={commitRenameProject}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRenameProject();
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
                            <Link
                              href={`/generate?projectId=${p.id}`}
                              onClick={onNavigate}
                              className="min-w-0 flex-1 text-left flex items-center gap-2"
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusColors[p.status] || "bg-gray-400")} />
                              <span className="truncate text-xs font-medium text-foreground">
                                {p.name}
                              </span>
                            </Link>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground"
                              onClick={() => startRenameProject(p.id, p.name)}
                              title="Rename project"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground"
                              onClick={() => duplicateProject(p.id)}
                              title="Duplicate project"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteProject(p.id)}
                              title="Delete project"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Conversations Section */}
          <div className="flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground-dim">
                Conversations
              </p>
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className="text-muted-foreground hover:text-primary"
                title="New conversation"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats…"
                  className="w-full rounded-md border border-border bg-input py-1 pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {conversations.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <MessageSquare className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground/30" />
                  <p className="text-[11px] text-muted-foreground-dim">No chats yet</p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      {renamingId === c.id ? (
                        <input
                          className="w-full rounded border border-primary bg-input px-2 py-1.5 text-xs"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          className={cn(
                            "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                            activeId === c.id
                              ? "bg-primary/15"
                              : "hover:bg-accent",
                          )}
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setActiveId(c.id);
                              onNavigate?.();
                            }}
                          >
                            <p className="truncate text-xs font-medium text-foreground">
                              {c.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground-dim">
                              {new Date(c.updatedAt).toLocaleDateString()}
                            </p>
                          </button>
                          
                          {/* Pin/Unpin action */}
                          <button
                            type="button"
                            className={cn(
                              "p-0.5 transition-opacity rounded hover:bg-black/20",
                              c.pinned ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => togglePinConversation(c.id)}
                            title={c.pinned ? "Unpin conversation" : "Pin conversation"}
                          >
                            <Pin className="h-2.5 w-2.5" />
                          </button>

                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground rounded hover:bg-black/20"
                            onClick={() => startRename(c.id, c.title)}
                            title="Rename"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </button>
                          
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive rounded hover:bg-black/20"
                            onClick={() => deleteConversation(c.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User profile section at the bottom */}
      <div className="relative border-t border-border p-3 mt-auto">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn("flex w-full items-center rounded-lg p-2 text-left transition-colors hover:bg-accent", isCollapsed ? "justify-center" : "gap-3")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/30 text-sm font-medium text-primary">
            {(profile?.display_name || profile?.username || "U")[0]?.toUpperCase()}
          </div>
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {profile?.display_name || profile?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {remaining}/{limit} credits
                </p>
              </div>
              <ChevronUp
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                  !menuOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>

        {menuOpen && (
          <div className={cn(
            "absolute bottom-full mb-1 rounded-lg border border-border bg-background py-1 shadow-lg z-50",
            isCollapsed ? "left-14 w-40" : "left-3 right-3"
          )}>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <CreditCard className="h-4 w-4" /> Billing
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <Briefcase className="h-4 w-4" /> Workspace
            </Link>
            <Link
              href="/dashboard/favorites"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <Heart className="h-4 w-4" /> Favorites
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <Clock className="h-4 w-4" /> History
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <Bell className="h-4 w-4" /> Notifications
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>

      {/* Brand Assets Dialog */}
      <Dialog open={brandAssetsOpen} onOpenChange={setBrandAssetsOpen}>
        <DialogContent className="max-w-2xl bg-background border border-border p-6 rounded-lg text-foreground max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Palette className="h-5 w-5 text-primary" /> Brand Assets Configuration
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure your brand logos, colors, fonts, and assets to apply to generated animations automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Left side: Logo & Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Brand Logo</label>
                <div className="flex items-center gap-4 border border-dashed border-border rounded-lg p-4 bg-accent/30">
                  {brandAssets.logo ? (
                    <div className="relative h-16 w-16 bg-black rounded border border-border flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={brandAssets.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...brandAssets, logo: undefined };
                          setBrandAssets(updated);
                          localStorage.setItem("volviq-brand-assets", JSON.stringify(updated));
                        }}
                        className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-accent rounded flex items-center justify-center text-muted-foreground">
                      <Image className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="brand-logo-file"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <label
                      htmlFor="brand-logo-file"
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/95 cursor-pointer"
                    >
                      Upload Logo
                    </label>
                    <p className="text-[10px] text-muted-foreground-dim mt-1">PNG, JPG or SVG. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Typography Font</label>
                <select
                  value={brandAssets.fontFamily}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Inter, sans-serif">Inter (Sleek Sans)</option>
                  <option value="Sora, sans-serif">Sora (Modern Display)</option>
                  <option value="Roboto, sans-serif">Roboto (Clean Sans)</option>
                  <option value="Georgia, serif">Georgia (Premium Serif)</option>
                  <option value="system-ui, sans-serif">System Default</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Brand Palette</label>
                <div className="grid grid-cols-2 gap-3 bg-accent/15 p-3 rounded-lg border border-border">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Primary Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={brandAssets.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border border-border bg-transparent"
                      />
                      <span className="text-xs uppercase font-mono">{brandAssets.colors.primary}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Secondary Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={brandAssets.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border border-border bg-transparent"
                      />
                      <span className="text-xs uppercase font-mono">{brandAssets.colors.secondary}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Background</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={brandAssets.colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border border-border bg-transparent"
                      />
                      <span className="text-xs uppercase font-mono">{brandAssets.colors.background}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Text</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={brandAssets.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border border-border bg-transparent"
                      />
                      <span className="text-xs uppercase font-mono">{brandAssets.colors.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side: Product & Campaign Images */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Campaign & Product Media Library</label>
              <div className="border border-dashed border-border rounded-lg p-4 bg-accent/30 flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  accept="image/*"
                  id="brand-images-file"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="brand-images-file"
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/95 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Product Image
                </label>
                <p className="text-[10px] text-muted-foreground-dim mt-1.5">Upload product shots or brand graphics to inject into templates.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48 border border-border p-2 rounded-lg bg-accent/10">
                {(!brandAssets.images || brandAssets.images.length === 0) ? (
                  <div className="col-span-3 text-center py-6 text-xs text-muted-foreground">
                    No custom media uploaded
                  </div>
                ) : (
                  brandAssets.images.map((img, i) => (
                    <div key={i} className="relative aspect-square bg-black rounded border border-border flex items-center justify-center overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Asset ${i}`} className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete asset"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DashboardSidebar({
  profile,
  onLogout,
  onSelectTemplate,
  mobileOpen = false,
  onMobileOpenChange,
}: DashboardSidebarProps) {
  const closeMobile = () => onMobileOpenChange?.(false);
  
  // Read collapse state to adjust width dynamically
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("volviq-sidebar-collapsed");
      if (stored === "true") {
        setIsCollapsed(true);
      }
      
      // Setup event listener to update local state if collapsed key is modified in storage
      const handleStorageChange = () => {
        setIsCollapsed(localStorage.getItem("volviq-sidebar-collapsed") === "true");
      };
      window.addEventListener("storage", handleStorageChange);
      // Custom event for same-window updates
      window.addEventListener("sidebar-collapsed-change", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("sidebar-collapsed-change", handleStorageChange);
      };
    }
  }, []);

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-background-elevated md:flex transition-all duration-300",
        isCollapsed ? "w-16" : "w-60 lg:w-64"
      )}>
        <SidebarContent
          profile={profile}
          onLogout={onLogout}
          onSelectTemplate={onSelectTemplate}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="relative flex h-full w-[min(100%,280px)] flex-col bg-background-elevated shadow-xl animate-in slide-in-from-left duration-200">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              profile={profile}
              onLogout={onLogout}
              onSelectTemplate={onSelectTemplate}
              onNavigate={closeMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}

export function DashboardSidebarMobileToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background-elevated shadow-md md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
