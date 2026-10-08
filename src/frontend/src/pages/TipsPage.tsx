import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PlatformPill } from "@/components/PlatformPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAddFavorite,
  useMarkTipDone,
  useRemoveFavorite,
  useTips,
  useTodayTip,
  useUnmarkTipDone,
} from "@/hooks/useChallenge";
import { formatDayKey } from "@/lib/day";
import { PLATFORMS, TIP_THEMES, themeLabel } from "@/lib/platform";
import { cn } from "@/lib/utils";
import type { Platform, TipTheme, TipView } from "@/types";
import { Check, Heart, Lightbulb, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type PlatformFilter = Platform | "all";
type ThemeFilter = TipTheme | "all";

export function TipsPage() {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [theme, setTheme] = useState<ThemeFilter>("all");
  const [search, setSearch] = useState("");

  const todayTip = useTodayTip();
  const tips = useTips(
    platform === "all" ? null : platform,
    theme === "all" ? null : theme,
  );
  const markDone = useMarkTipDone();
  const unmarkDone = useUnmarkTipDone();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const donePending = markDone.isPending || unmarkDone.isPending;
  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

  const filtered = useMemo(() => {
    const list = tips.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (tip) =>
        tip.title.toLowerCase().includes(query) ||
        tip.summary.toLowerCase().includes(query) ||
        tip.actionStep.toLowerCase().includes(query),
    );
  }, [tips.data, search]);

  const hasFilters = platform !== "all" || theme !== "all" || search !== "";

  const resetFilters = () => {
    setPlatform("all");
    setTheme("all");
    setSearch("");
  };

  const toggleDone = (tip: TipView) =>
    tip.done ? unmarkDone.mutate(tip.id) : markDone.mutate(tip.id);

  const toggleFavorite = (tip: TipView) =>
    tip.favorite ? removeFavorite.mutate(tip.id) : addFavorite.mutate(tip.id);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Tips Jualan
        </h1>
        <p className="text-sm text-muted-foreground">
          Kumpulan tips praktis untuk seller Shopee, TikTok Shop, dan Lazada.
        </p>
      </header>

      <section aria-labelledby="today-tip-heading">
        <Card className="overflow-hidden rounded-3xl border-border/70 shadow-card">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="today-tip-heading"
                className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
              >
                <Lightbulb className="size-5 text-primary" aria-hidden="true" />
                Tips Hari Ini
              </h2>
              {todayTip.data ? (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                  {themeLabel(todayTip.data.theme)}
                </span>
              ) : null}
            </div>

            {todayTip.isLoading ? (
              <LoadingState count={1} />
            ) : todayTip.data ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {todayTip.data.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {todayTip.data.summary}
                  </p>
                  <p className="rounded-xl bg-primary-soft/60 p-3 text-sm text-primary-deep">
                    <span className="font-semibold">Langkah: </span>
                    {todayTip.data.actionStep}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PlatformPill platform={todayTip.data.platform} />
                    <span className="text-[11px] text-muted-foreground">
                      {formatDayKey(todayTip.data.day)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(todayTip.data as TipView)}
                      disabled={favoritePending}
                      aria-label={
                        todayTip.data.favorite
                          ? "Hapus dari favorit"
                          : "Simpan ke favorit"
                      }
                      aria-pressed={todayTip.data.favorite}
                      data-ocid="tips.today_favorite_button"
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full transition-colors",
                        todayTip.data.favorite
                          ? "bg-destructive-soft text-destructive"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          todayTip.data.favorite && "fill-current",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    <Button
                      type="button"
                      variant={todayTip.data.done ? "outline" : "default"}
                      disabled={donePending}
                      onClick={() => toggleDone(todayTip.data as TipView)}
                      data-ocid="tips.today_done_button"
                      className={cn(
                        "rounded-full",
                        !todayTip.data.done && "shadow-primary-glow",
                      )}
                    >
                      {todayTip.data.done ? (
                        "Batalkan"
                      ) : (
                        <>
                          <Check className="size-4" aria-hidden="true" />
                          Tandai Selesai
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada tips untuk hari ini. Cek kembali besok, ya!
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="all-tips-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="all-tips-heading"
            className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
          >
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Semua Tips
          </h2>
          {!tips.isLoading ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {filtered.length} tips
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari tips…"
              aria-label="Cari tips"
              data-ocid="tips.search_input"
              className="rounded-full pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={platform === "all"}
              onClick={() => setPlatform("all")}
              ocid="tips.platform.all.tab"
            >
              Semua platform
            </FilterChip>
            {PLATFORMS.map((item) => (
              <FilterChip
                key={item.value}
                active={platform === item.value}
                onClick={() => setPlatform(item.value)}
                ocid={`tips.platform.${item.value}.tab`}
              >
                {item.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={theme === "all"}
              onClick={() => setTheme("all")}
              ocid="tips.theme.all.tab"
            >
              Semua tema
            </FilterChip>
            {TIP_THEMES.map((item) => (
              <FilterChip
                key={item.value}
                active={theme === item.value}
                onClick={() => setTheme(item.value)}
                ocid={`tips.theme.${item.value}.tab`}
              >
                {item.label}
              </FilterChip>
            ))}
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              data-ocid="tips.reset_filters_button"
              className="inline-flex items-center gap-1.5 rounded-full px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
              Reset filter
            </button>
          ) : null}
        </div>

        {tips.isLoading ? (
          <LoadingState count={4} className="sm:grid-cols-2" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Belum ada tips yang cocok"
            description="Coba ubah filter platform atau tema, atau hapus kata kunci pencarianmu."
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  data-ocid="tips.empty_reset_button"
                  className="rounded-full"
                >
                  Reset filter
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((tip, index) => (
              <li key={tip.id.toString()}>
                <TipCard
                  tip={tip}
                  index={index}
                  onToggleDone={() => toggleDone(tip)}
                  onToggleFavorite={() => toggleFavorite(tip)}
                  donePending={donePending}
                  favoritePending={favoritePending}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  ocid: string;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, ocid, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-ocid={ocid}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-primary-glow"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

interface TipCardProps {
  tip: TipView;
  index: number;
  onToggleDone: () => void;
  onToggleFavorite: () => void;
  donePending: boolean;
  favoritePending: boolean;
}

function TipCard({
  tip,
  index,
  onToggleDone,
  onToggleFavorite,
  donePending,
  favoritePending,
}: TipCardProps) {
  return (
    <Card
      data-ocid={`tips.item.${index + 1}`}
      className="h-full rounded-2xl border-border/70 shadow-subtle"
    >
      <CardContent className="flex h-full flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
            {themeLabel(tip.theme)}
          </span>
          <button
            type="button"
            onClick={onToggleFavorite}
            disabled={favoritePending}
            aria-label={
              tip.favorite ? "Hapus dari favorit" : "Simpan ke favorit"
            }
            aria-pressed={tip.favorite}
            data-ocid={`tips.favorite_button.${index + 1}`}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              tip.favorite
                ? "bg-destructive-soft text-destructive"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Heart
              className={cn("size-4", tip.favorite && "fill-current")}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-display text-base font-semibold text-foreground">
            {tip.title}
          </h3>
          <p className="text-sm text-muted-foreground">{tip.summary}</p>
          <p className="rounded-xl bg-primary-soft/60 p-3 text-sm text-primary-deep">
            <span className="font-semibold">Langkah: </span>
            {tip.actionStep}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <PlatformPill platform={tip.platform} compact />
            <span className="text-[11px] text-muted-foreground">
              {formatDayKey(tip.day)}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant={tip.done ? "outline" : "default"}
            disabled={donePending}
            onClick={onToggleDone}
            data-ocid={`tips.done_button.${index + 1}`}
            className="rounded-full"
          >
            {tip.done ? (
              "Batalkan"
            ) : (
              <>
                <Check className="size-3.5" aria-hidden="true" />
                Tandai Selesai
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
