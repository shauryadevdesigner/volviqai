import { cn } from "@/lib/utils";

export function GlassSpinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 rounded-full animate-spin",
        "border-2 border-white/25 border-t-white/90",
        className,
      )}
    />
  );
}
