const FALLBACK_CLASS = "bg-gray-500/15 text-gray-400";

interface StatusBadgeProps {
  label: string;
  /** Color classes; falls back to neutral gray. */
  className?: string;
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        className ?? FALLBACK_CLASS
      }`}
    >
      {label}
    </span>
  );
}
