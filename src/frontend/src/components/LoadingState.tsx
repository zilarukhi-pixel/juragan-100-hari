import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton cards to render. */
  count?: number;
  className?: string;
}

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, i) => `loading-skeleton-${i}`,
);

/** Layout-matched skeleton cards shown while backend data loads. */
export function LoadingState({ count = 3, className }: LoadingStateProps) {
  return (
    <div className={cn("grid gap-4", className)} aria-busy="true">
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div
          key={id}
          className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-subtle"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
