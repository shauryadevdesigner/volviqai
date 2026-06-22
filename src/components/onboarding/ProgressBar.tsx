interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = (step / total) * 100;
  return (
    <div className="mb-8">
      <p className="mb-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
        Step {step} of {total}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
