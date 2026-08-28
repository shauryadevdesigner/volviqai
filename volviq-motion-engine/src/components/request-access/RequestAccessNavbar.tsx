import Link from 'next/link';

export default function RequestAccessNavbar() {
  return (
    <nav className="fixed top-0 left-1/2 z-50 flex w-[calc(100%-48px)] max-w-container-max -translate-x-1/2 items-center justify-between rounded-full border border-outline-variant bg-surface/70 px-8 py-3 backdrop-blur-md mt-margin-desktop transition-all duration-300 hover:border-primary/30">
      <Link
        href="/"
        className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary transition-all duration-300 hover:tracking-widest select-none"
      >
        VOLVIQ AI
      </Link>

      <span className="hidden font-code-md text-[9px] uppercase tracking-widest text-purple-400/80 sm:block">
        Early Access Portal
      </span>

      <Link
        href="/"
        className="relative overflow-hidden group rounded-full bg-primary px-6 py-2 font-label-md text-label-md text-surface transition-all duration-300"
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
          Back Home
        </span>
        <span className="absolute inset-0 scale-x-0 rounded-full bg-surface transition-transform origin-right duration-300 group-hover:scale-x-100" />
        <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-primary" />
      </Link>
    </nav>
  );
}
