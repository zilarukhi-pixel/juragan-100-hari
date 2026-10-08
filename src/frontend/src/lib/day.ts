import type { DayKey } from "@/backend";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Format a JS Date as a DayKey (YYYYMMDD) bigint. */
export function dateToDayKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return BigInt(`${y}${m}${d}`);
}

/** Today's DayKey in the user's local timezone. */
export function todayDayKey(): DayKey {
  return dateToDayKey(new Date());
}

/** Parse a DayKey (YYYYMMDD) into a local Date, or null when malformed. */
export function dayKeyToDate(day: DayKey): Date | null {
  const raw = day.toString();
  if (raw.length !== 8) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const date = Number(raw.slice(6, 8));
  if (!year || !month || !date) return null;
  const parsed = new Date(year, month - 1, date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Convert a DayKey into the `yyyy-mm-dd` value an <input type="date"> expects. */
export function dayKeyToInputValue(day: DayKey): string {
  const date = dayKeyToDate(day);
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Convert an <input type="date"> value into a DayKey, or null when empty/invalid. */
export function inputValueToDayKey(value: string): DayKey | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return BigInt(
    `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`,
  );
}

/** Human label for a DayKey, e.g. "7 Okt 2026". */
export function formatDayKey(day: DayKey): string {
  const date = dayKeyToDate(day);
  if (!date) return "Tanggal tidak diketahui";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Short weekday label, e.g. "Sen". */
export function formatWeekday(day: DayKey): string {
  const date = dayKeyToDate(day);
  if (!date) return "—";
  return date.toLocaleDateString("id-ID", { weekday: "short" });
}

/** The last `count` DayKeys ending today, oldest first. */
export function recentDayKeys(count: number): DayKey[] {
  const today = new Date();
  const keys: DayKey[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(dateToDayKey(new Date(today.getTime() - i * DAY_MS)));
  }
  return keys;
}

/** Difference in whole days between two DayKeys (b - a). */
export function daysBetween(a: DayKey, b: DayKey): number {
  const dateA = dayKeyToDate(a);
  const dateB = dayKeyToDate(b);
  if (!dateA || !dateB) return 0;
  return Math.round((dateB.getTime() - dateA.getTime()) / DAY_MS);
}
