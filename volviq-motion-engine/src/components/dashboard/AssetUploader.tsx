"use client";

import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { UploadedAsset, AssetRole } from "@/types/assets";

interface AssetUploaderProps {
  accessToken: string | null;
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 50;

export function AssetUploader({
  accessToken,
  assets,
  onAssetsChange,
  disabled,
}: AssetUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const file = files[0];

    // Client-side validation
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(
        `This file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload an asset under 50MB.`
      );
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("role", type === "image" ? "product" : "reference_video");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed. Please try again.");
      }

      const uploaded: UploadedAsset = await res.json();

      // Trigger asynchronous asset analysis
      void fetch("/api/analyze-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          url: uploaded.url,
          type: uploaded.type,
          filename: uploaded.filename,
        }),
      })
        .then((r) => r.json())
        .then((analysis) => {
          onAssetsChange(
            assets.map((a) => (a.id === uploaded.id ? { ...a, analysis } : a))
          );
        })
        .catch(() => {});

      onAssetsChange([...assets, uploaded]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload asset.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter((a) => a.id !== id));
  };

  const updateRole = (id: string, role: AssetRole) => {
    onAssetsChange(
      assets.map((a) => (a.id === id ? { ...a, role } : a))
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full pt-2">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
        disabled={disabled || uploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "video")}
        disabled={disabled || uploading}
      />

      {/* Buttons to trigger uploads */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/30 hover:bg-muted/60 text-foreground/80 hover:text-foreground border border-border/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span>Add Image</span>
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/30 hover:bg-muted/60 text-foreground/80 hover:text-foreground border border-border/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Add Video</span>
        </button>

        {uploading && (
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Analyzing asset...</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-destructive hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attached Assets Pills & Previews */}
      {assets.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background-elevated border border-border/70 text-xs shadow-sm max-w-sm group"
            >
              {asset.type === "image" ? (
                <div className="w-7 h-7 rounded overflow-hidden bg-black/40 flex items-center justify-center shrink-0 border border-border/40">
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded bg-purple-950/40 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-400">
                  <VideoIcon className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="flex flex-col min-w-0 pr-1">
                <span className="font-medium text-foreground truncate max-w-[130px]" title={asset.filename}>
                  {asset.filename}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <select
                    value={asset.role || "product"}
                    onChange={(e) => updateRole(asset.id, e.target.value as AssetRole)}
                    className="bg-transparent text-primary/90 hover:text-primary font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="product" className="bg-background-elevated text-foreground">Product</option>
                    <option value="brand" className="bg-background-elevated text-foreground">Brand/Logo</option>
                    <option value="reference_image" className="bg-background-elevated text-foreground">Inspiration</option>
                    <option value="background" className="bg-background-elevated text-foreground">Background</option>
                  </select>
                  {asset.analysis && (
                    <span title="Analyzed by AI" className="shrink-0 flex items-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAsset(asset.id)}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors ml-1"
                aria-label={`Remove ${asset.filename}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
