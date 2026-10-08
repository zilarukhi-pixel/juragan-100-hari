import type { Platform } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { platformMeta } from "@/lib/platform";
import { cn } from "@/lib/utils";

interface PlatformPillProps {
  platform: Platform;
  /** Use the compact label (e.g. "TikTok" instead of "TikTok Shop"). */
  compact?: boolean;
  className?: string;
}

/** A marketplace chip: Shopee / TikTok Shop / Lazada. */
export function PlatformPill({
  platform,
  compact = false,
  className,
}: PlatformPillProps) {
  const meta = platformMeta(platform);
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        meta.className,
        className,
      )}
    >
      {compact ? meta.short : meta.label}
    </Badge>
  );
}
