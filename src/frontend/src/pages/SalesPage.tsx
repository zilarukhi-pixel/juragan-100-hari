import { Platform } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PlatformPill } from "@/components/PlatformPill";
import { StatTile } from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRecordSales, useSales } from "@/hooks/useChallenge";
import {
  dayKeyToInputValue,
  formatDayKey,
  formatWeekday,
  inputValueToDayKey,
  recentDayKeys,
  todayDayKey,
} from "@/lib/day";
import { formatCount, parseQuantity } from "@/lib/format";
import { PLATFORMS, platformLabel, platformMeta } from "@/lib/platform";
import { cn } from "@/lib/utils";
import type { DayKey, SalesEntry } from "@/types";
import { BarChart3, Package, Plus, RotateCcw, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

type PlatformFilter = Platform | "all";

const CHART_DAYS = 7;

interface DayBar {
  key: string;
  day: DayKey;
  label: string;
  quantity: number;
}

/** Aggregate the last 7 days of sales into chart bars, oldest first. */
function buildWeekBars(entries: SalesEntry[]): DayBar[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.day.toString();
    totals.set(key, (totals.get(key) ?? 0) + Number(entry.quantity));
  }
  return recentDayKeys(CHART_DAYS).map((day) => {
    const key = day.toString();
    return {
      key,
      day,
      label: formatWeekday(day),
      quantity: totals.get(key) ?? 0,
    };
  });
}

export function SalesPage() {
  const [quantity, setQuantity] = useState("");
  const [platform, setPlatform] = useState<Platform>(Platform.shopee);
  const [day, setDay] = useState(dayKeyToInputValue(todayDayKey()));
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [filterPlatform, setFilterPlatform] = useState<PlatformFilter>("all");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");

  const record = useRecordSales();

  const fromKey: DayKey | null = inputValueToDayKey(fromDay);
  const toKey: DayKey | null = inputValueToDayKey(toDay);
  const sales = useSales(
    filterPlatform === "all" ? null : filterPlatform,
    fromKey,
    toKey,
  );

  const entries = sales.data ?? [];
  const total = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.quantity, 0n),
    [entries],
  );

  const perPlatform = useMemo(() => {
    const totals = new Map<Platform, bigint>();
    for (const entry of entries) {
      totals.set(
        entry.platform,
        (totals.get(entry.platform) ?? 0n) + entry.quantity,
      );
    }
    return PLATFORMS.map((meta) => ({
      meta,
      quantity: totals.get(meta.value) ?? 0n,
    }));
  }, [entries]);

  const weekBars = useMemo(() => buildWeekBars(entries), [entries]);
  const weekMax = useMemo(
    () => weekBars.reduce((max, bar) => Math.max(max, bar.quantity), 0),
    [weekBars],
  );

  const hasFilters = filterPlatform !== "all" || fromDay !== "" || toDay !== "";

  const resetFilters = () => {
    setFilterPlatform("all");
    setFromDay("");
    setToDay("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseQuantity(quantity);
    const dayKey = inputValueToDayKey(day);
    if (!parsed) {
      setFormError("Masukkan jumlah barang yang valid (lebih dari 0).");
      return;
    }
    if (!dayKey) {
      setFormError("Pilih tanggal penjualan.");
      return;
    }
    setFormError(null);
    const captured = { quantity, note };
    setQuantity("");
    setNote("");
    record.mutate(
      { day: dayKey, quantity: parsed, platform },
      {
        onError: () => {
          setQuantity((current) =>
            current === "" ? captured.quantity : current,
          );
          setNote((current) => (current === "" ? captured.note : current));
          setFormError("Gagal menyimpan penjualan. Coba lagi.");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Catat Penjualan
        </h1>
        <p className="text-sm text-muted-foreground">
          Catat penjualan harianmu agar progres tantangan ikut bertambah.
        </p>
      </header>

      <Card className="rounded-3xl border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Penjualan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sales-quantity">Jumlah barang</Label>
                <Input
                  id="sales-quantity"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="cth. 120"
                  data-ocid="penjualan.quantity_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-platform">Platform</Label>
                <Select
                  value={platform}
                  onValueChange={(value) => setPlatform(value as Platform)}
                >
                  <SelectTrigger
                    id="sales-platform"
                    data-ocid="penjualan.platform_select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-day">Tanggal</Label>
                <Input
                  id="sales-day"
                  type="date"
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  data-ocid="penjualan.day_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-note">Catatan (opsional)</Label>
                <Textarea
                  id="sales-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="cth. promo flash sale"
                  data-ocid="penjualan.note_textarea"
                  className="min-h-9"
                />
              </div>
            </div>

            {formError ? (
              <p
                role="alert"
                data-ocid="penjualan.error_state"
                className="text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={record.isPending}
              data-ocid="penjualan.submit_button"
              className="w-full rounded-full shadow-primary-glow sm:w-auto"
            >
              <Plus className="size-4" aria-hidden="true" />
              {record.isPending ? "Menyimpan…" : "Simpan Penjualan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section
        aria-label="Ringkasan penjualan"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatTile
          icon={Package}
          label="Total barang (terfilter)"
          value={formatCount(total)}
          tone="primary"
        />
        <StatTile
          icon={BarChart3}
          label="Jumlah catatan"
          value={String(entries.length)}
          tone="accent"
        />
        <StatTile
          icon={TrendingUp}
          label="Rata-rata per catatan"
          value={
            entries.length > 0
              ? formatCount(total / BigInt(entries.length))
              : "0"
          }
          tone="success"
        />
      </section>

      <Card className="rounded-3xl border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Jual {CHART_DAYS} Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-ocid="penjualan.chart"
            className="flex h-40 items-end justify-between gap-2"
            role="img"
            aria-label={`Grafik penjualan ${CHART_DAYS} hari terakhir`}
          >
            {weekBars.map((bar) => {
              const height =
                weekMax > 0 ? Math.max(6, (bar.quantity / weekMax) * 100) : 6;
              return (
                <div
                  key={bar.key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {bar.quantity > 0 ? formatCount(BigInt(bar.quantity)) : ""}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      data-ocid={`penjualan.chart.bar.${bar.key}`}
                      className={cn(
                        "w-full rounded-t-lg transition-smooth",
                        bar.quantity > 0 ? "bg-gradient-primary" : "bg-muted",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="sales-breakdown-heading" className="space-y-3">
        <h2
          id="sales-breakdown-heading"
          className="font-display text-lg font-bold text-foreground"
        >
          Rincian per Platform
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {perPlatform.map(({ meta, quantity: platformTotal }) => (
            <div
              key={meta.value}
              data-ocid={`penjualan.breakdown.${meta.value}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle"
            >
              <PlatformPill platform={meta.value} />
              <span className="font-display text-lg font-bold tabular-nums text-foreground">
                {formatCount(platformTotal)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="sales-list-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="sales-list-heading"
            className="font-display text-lg font-bold text-foreground"
          >
            Riwayat Penjualan
          </h2>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              data-ocid="penjualan.filter.reset_button"
              className="rounded-full text-muted-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset filter
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-platform">Platform</Label>
            <Select
              value={filterPlatform}
              onValueChange={(value) =>
                setFilterPlatform(value as PlatformFilter)
              }
            >
              <SelectTrigger
                id="filter-platform"
                data-ocid="penjualan.filter.platform_select"
                className="w-full"
              >
                <SelectValue placeholder="Semua platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua platform</SelectItem>
                {PLATFORMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-from">Dari tanggal</Label>
            <Input
              id="filter-from"
              type="date"
              value={fromDay}
              onChange={(event) => setFromDay(event.target.value)}
              data-ocid="penjualan.filter.from_input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-to">Sampai tanggal</Label>
            <Input
              id="filter-to"
              type="date"
              value={toDay}
              onChange={(event) => setToDay(event.target.value)}
              data-ocid="penjualan.filter.to_input"
            />
          </div>
        </div>

        {sales.isLoading ? (
          <LoadingState count={3} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada penjualan tercatat"
            description="Catat penjualan pertamamu di form di atas, atau ubah filter tanggal dan platform."
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  data-ocid="penjualan.empty_state.reset_button"
                  className="rounded-full"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset filter
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-2">
            {entries.map((entry, index) => (
              <li
                key={`${entry.day.toString()}-${entry.platform}-${entry.updatedAt.toString()}`}
                data-ocid={`penjualan.item.${index + 1}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PlatformPill platform={entry.platform} compact />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDayKey(entry.day)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {platformLabel(entry.platform)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-display text-base font-bold tabular-nums text-foreground">
                  {formatCount(entry.quantity)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    barang
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
