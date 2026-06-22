interface OptionChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionChip({ label, selected, onClick }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 font-body-md text-body-md transition-all ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}
