import { Platform, TipTheme } from "@/backend";
import {
  dateToDayKey,
  dayKeyToInputValue,
  daysBetween,
  inputValueToDayKey,
  recentDayKeys,
} from "@/lib/day";
import {
  clampPercent,
  formatCount,
  formatNumber,
  parseQuantity,
} from "@/lib/format";
import { platformLabel, themeLabel } from "@/lib/platform";
import { describe, expect, it } from "vitest";

describe("format helpers", () => {
  it("formats counts with Indonesian thousand separators", () => {
    expect(formatNumber(340_000)).toBe("340.000");
    expect(formatCount(1_000_000n)).toBe("1.000.000");
  });

  it("clamps percentages into 0..100", () => {
    expect(clampPercent(150n)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(42n)).toBe(42);
  });

  it("parses a positive quantity and rejects zero or empty input", () => {
    expect(parseQuantity("1.000")).toBe(1_000n);
    expect(parseQuantity("0")).toBeNull();
    expect(parseQuantity("")).toBeNull();
  });
});

describe("day helpers", () => {
  it("round-trips a DayKey through the date input value", () => {
    const key = dateToDayKey(new Date(2026, 0, 7));
    expect(key).toBe(20260107n);
    expect(dayKeyToInputValue(key)).toBe("2026-01-07");
    expect(inputValueToDayKey("2026-01-07")).toBe(20260107n);
  });

  it("returns null for an empty date input", () => {
    expect(inputValueToDayKey("")).toBeNull();
  });

  it("returns the requested number of consecutive day keys ending today", () => {
    const keys = recentDayKeys(7);
    expect(keys).toHaveLength(7);
    expect(daysBetween(keys[0], keys[6])).toBe(6);
  });
});

describe("platform helpers", () => {
  it("maps platform and theme values to Indonesian labels", () => {
    expect(platformLabel(Platform.shopee)).toBe("Shopee");
    expect(platformLabel(Platform.tiktokShop)).toBe("TikTok Shop");
    expect(themeLabel(TipTheme.layananPelanggan)).toBe("Layanan Pelanggan");
  });
});
