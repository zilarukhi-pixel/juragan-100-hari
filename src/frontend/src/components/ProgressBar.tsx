import { clampPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Percentage 0..100. */
  value: number | bigint;
  className?: string;
  /** Height utility, defaults to a thick hero bar. */
  heightClassName?: string;
  /** Render the gradient streak fill instead of the solid primary fill. */
  gradient?: boolean;
  label?: string;
}

/**
 * A rounded progress bar with an animated fill.
 * Uses a native <progress> element so the value is exposed to assistive tech.
 */
export function ProgressBar({
  value,
  className,
  heightClassName = "h-3",
  gradient = true,
  label,
}: ProgressBarProps) {
  const percent = clampPercent(value);
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-primary/15",
        heightClassName,
        className,
      )}
    >
      <progress
        value={percent}
        max={100}
        aria-label={label ?? "Progres tantangan"}
        className="sr-only"
      >
        {percent}%
      </progress>
      <div
        aria-hidden="true"
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          gradient ? "bg-gradient-streak" : "bg-primary",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
