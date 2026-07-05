import React, { useState, useEffect } from "react";

export interface RiveLoaderProps {
  src: string;
  fallback?: React.ReactNode;
  children: (resolvedSrc: string) => React.ReactNode;
}

export const RiveLoader: React.FC<RiveLoaderProps> = ({
  src,
  fallback,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    // Resolve URL (e.g., handles relative URLs, local static files, and remote CDNs)
    const resolveAsset = async () => {
      try {
        // If it's a relative URL, check if we need to resolve it against public directory
        let finalUrl = src;
        if (src.startsWith("/")) {
          finalUrl = src;
        }

        // Test if asset exists/is fetchable
        const res = await fetch(finalUrl, { method: "HEAD" });
        if (!res.ok) {
          throw new Error(`Rive asset not found: status ${res.status}`);
        }

        if (active) {
          setResolvedSrc(finalUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Rive asset:", err);
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    resolveAsset();

    return () => {
      active = false;
    };
  }, [src]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        {fallback || (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "sans-serif" }}>
            Loading Animation...
          </div>
        )}
      </div>
    );
  }

  if (error || !resolvedSrc) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "rgba(255,0,0,0.05)", border: "1px dashed rgba(255,0,0,0.2)", borderRadius: 8 }}>
        <div style={{ color: "#ef4444", fontSize: 13, fontFamily: "monospace", textAlign: "center", padding: 12 }}>
          Failed to load Rive animation
        </div>
      </div>
    );
  }

  return <>{children(resolvedSrc)}</>;
};
