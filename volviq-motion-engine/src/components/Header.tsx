/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

interface HeaderProps {
  asLink?: boolean;
}

export function Header({ asLink = false }: HeaderProps) {
  const content = (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary"
        aria-hidden
      >
        V
      </div>
      <span className="text-xl font-bold text-foreground">Volviq AI</span>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}
