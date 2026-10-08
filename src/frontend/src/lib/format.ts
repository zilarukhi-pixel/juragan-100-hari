/** Format a number with Indonesian thousand separators, e.g. 340000 -> "340.000". */
export function formatNumber(value: number | bigint): string {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("id-ID").format(Math.round(numeric));
}

/** Format a bigint count compactly, e.g. 1_000_000n -> "1.000.000". */
export function formatCount(value: bigint): string {
  return formatNumber(value);
}

/** Clamp a percentage into 0..100 and round it. */
export function clampPercent(value: number | bigint): number {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

/** Convert a nanosecond backend timestamp into a local Date, or null. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Human date-time label for a backend timestamp. */
export function formatTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Parse a user-entered quantity string into a non-negative bigint, or null. */
export function parseQuantity(raw: string): bigint | null {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  try {
    const value = BigInt(cleaned);
    return value > 0n ? value : null;
  } catch {
    return null;
  }
}
