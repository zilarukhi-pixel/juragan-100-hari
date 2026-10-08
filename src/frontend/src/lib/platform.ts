import { Platform, TipTheme } from "@/backend";
import type { MilestoneMeta, PlatformMeta, ThemeMeta } from "@/types";

export const PLATFORMS: PlatformMeta[] = [
  {
    value: Platform.shopee,
    label: "Shopee",
    short: "Shopee",
    className: "border-transparent bg-[oklch(0.62_0.19_35)] text-white",
  },
  {
    value: Platform.tiktokShop,
    label: "TikTok Shop",
    short: "TikTok",
    className: "border-transparent bg-foreground text-background",
  },
  {
    value: Platform.lazada,
    label: "Lazada",
    short: "Lazada",
    className: "border-transparent bg-[oklch(0.5_0.2_274)] text-white",
  },
];

const PLATFORM_BY_VALUE: Record<Platform, PlatformMeta> = {
  [Platform.shopee]: PLATFORMS[0],
  [Platform.tiktokShop]: PLATFORMS[1],
  [Platform.lazada]: PLATFORMS[2],
};

export function platformMeta(platform: Platform): PlatformMeta {
  return PLATFORM_BY_VALUE[platform] ?? PLATFORMS[0];
}

export function platformLabel(platform: Platform): string {
  return platformMeta(platform).label;
}

export const TIP_THEMES: ThemeMeta[] = [
  {
    value: TipTheme.listing,
    label: "Listing",
    className: "border-transparent bg-primary-soft text-primary-deep",
  },
  {
    value: TipTheme.konten,
    label: "Konten",
    className: "border-transparent bg-accent-soft text-accent",
  },
  {
    value: TipTheme.promosi,
    label: "Promosi",
    className: "border-transparent bg-warning-soft text-warning-foreground",
  },
  {
    value: TipTheme.layananPelanggan,
    label: "Layanan Pelanggan",
    className: "border-transparent bg-success-soft text-success",
  },
  {
    value: TipTheme.analisisData,
    label: "Analisis Data",
    className: "border-transparent bg-secondary text-secondary-foreground",
  },
];

const THEME_BY_VALUE: Record<TipTheme, ThemeMeta> = {
  [TipTheme.listing]: TIP_THEMES[0],
  [TipTheme.konten]: TIP_THEMES[1],
  [TipTheme.promosi]: TIP_THEMES[2],
  [TipTheme.layananPelanggan]: TIP_THEMES[3],
  [TipTheme.analisisData]: TIP_THEMES[4],
};

export function themeMeta(theme: TipTheme): ThemeMeta {
  return THEME_BY_VALUE[theme] ?? TIP_THEMES[0];
}

export function themeLabel(theme: TipTheme): string {
  return themeMeta(theme).label;
}

export const MILESTONES: MilestoneMeta[] = [
  { thresholdPercent: 10, title: "Awal yang Kuat" },
  { thresholdPercent: 25, title: "Seperempat Jalan" },
  { thresholdPercent: 50, title: "Separuh Perjalanan" },
  { thresholdPercent: 75, title: "Gaspol Akhir" },
  { thresholdPercent: 100, title: "Juara 1 Juta" },
];
