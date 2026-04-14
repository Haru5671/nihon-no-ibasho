interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Chip({ label, active, onClick, className = "" }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
        active
          ? "bg-primary text-on-primary"
          : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim"
      } ${className}`}
    >
      {label}
    </button>
  );
}
