import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  /** Accent tone for the icon chip. */
  tone?: "primary" | "success" | "accent";
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary-deep",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-accent",
};

/** A compact metric tile: icon chip, big value, label. */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
          {label}
        </p>
        {hint ? (
          <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
