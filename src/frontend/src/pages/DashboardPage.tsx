import type { NavKey } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PlatformPill } from "@/components/PlatformPill";
import { ProgressBar } from "@/components/ProgressBar";
import { StatTile } from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useChallenge,
  useMarkTipDone,
  useProgress,
  useSales,
  useStartChallenge,
  useTodayTip,
  useUnmarkTipDone,
} from "@/hooks/useChallenge";
import { formatWeekday, recentDayKeys, todayDayKey } from "@/lib/day";
import { clampPercent, formatCount, formatNumber } from "@/lib/format";
import { MILESTONES, PLATFORMS, themeLabel } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { CHALLENGE_DAYS, CHALLENGE_TARGET } from "@/types";
import {
  BarChart3,
  BookOpen,
  Check,
  Flame,
  Lightbulb,
  Package,
  Store,
  Target,
  TrendingUp,
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (key: NavKey) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const challenge = useChallenge();
  const progress = useProgress();
  const todayTip = useTodayTip();
  const startChallenge = useStartChallenge();
  const markDone = useMarkTipDone();
  const unmarkDone = useUnmarkTipDone();

  const weekKeys = recentDayKeys(7);
  const sales = useSales(null, weekKeys[0], weekKeys[6]);

  const isLoading =
    challenge.isLoading || progress.isLoading || todayTip.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState count={2} />
        <LoadingState count={1} />
      </div>
    );
  }

  if (!challenge.data) {
    return (
      <EmptyState
        icon={Target}
        title="Mulai tantangan 100 harimu"
        description="Tetapkan target 1.000.000 barang dan mulai catat penjualan hari ini. Progres, streak, dan milestone akan muncul di sini."
        className="animate-fade-up"
        action={
          <Button
            type="button"
            size="lg"
            disabled={startChallenge.isPending}
            data-ocid="dashboard.start_challenge_button"
            onClick={() =>
              startChallenge.mutate({
                target: CHALLENGE_TARGET,
                startDay: todayDayKey(),
              })
            }
            className="rounded-full shadow-primary-glow"
          >
            <Target className="size-4" aria-hidden="true" />
            {startChallenge.isPending ? "Memulai…" : "Mulai Tantangan"}
          </Button>
        }
      />
    );
  }

  const data = progress.data;
  const totalSold = data?.totalSold ?? 0n;
  const percent = clampPercent(data?.percent ?? 0n);
  const dayNumber = Number(data?.dayNumber ?? 1n);
  const daysRemaining = Number(data?.daysRemaining ?? BigInt(CHALLENGE_DAYS));
  const streak = Number(data?.currentStreak ?? 0n);
  const tip = todayTip.data;

  const salesByDay = new Map<string, number>();
  for (const entry of sales.data ?? []) {
    const key = entry.day.toString();
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(entry.quantity));
  }
  const chartPoints = weekKeys.map((day) => ({
    day,
    label: formatWeekday(day),
    quantity: salesByDay.get(day.toString()) ?? 0,
  }));
  const maxQuantity = Math.max(1, ...chartPoints.map((p) => p.quantity));

  const platformTotals = new Map<string, number>();
  for (const [platform, quantity] of data?.perPlatform ?? []) {
    platformTotals.set(platform, Number(quantity));
  }
  const platformRows = PLATFORMS.map((meta) => ({
    meta,
    quantity: platformTotals.get(meta.value) ?? 0,
  }));
  const maxPlatformQuantity = Math.max(
    1,
    ...platformRows.map((row) => row.quantity),
  );

  const milestoneRows =
    data?.milestones && data.milestones.length > 0
      ? data.milestones.map((milestone) => ({
          key: Number(milestone.thresholdPercent),
          thresholdPercent: Number(milestone.thresholdPercent),
          title: milestone.title,
          unlocked: milestone.unlocked,
        }))
      : MILESTONES.map((milestone) => ({
          key: milestone.thresholdPercent,
          thresholdPercent: milestone.thresholdPercent,
          title: milestone.title,
          unlocked: percent >= milestone.thresholdPercent,
        }));

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="progress-heading"
        data-ocid="dashboard.progress_card"
        className="animate-fade-up"
      >
        <Card className="overflow-hidden rounded-3xl border-border/70 shadow-card">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progres tantangan
                </p>
                <h2
                  id="progress-heading"
                  className="mt-1 font-display text-2xl font-bold text-foreground"
                >
                  Hari ke-{dayNumber} dari {CHALLENGE_DAYS}
                </h2>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft font-display text-lg font-bold text-primary-deep tabular-nums">
                {percent}%
              </span>
            </div>

            <ProgressBar value={percent} heightClassName="h-4" />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl font-bold tabular-nums text-foreground">
                {formatCount(totalSold)}
                <span className="text-sm font-medium text-muted-foreground">
                  {" / "}
                  {formatCount(CHALLENGE_TARGET)} barang
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {daysRemaining > 0
                  ? `${daysRemaining} hari lagi`
                  : "Tantangan selesai"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        aria-label="Ringkasan metrik"
        data-ocid="dashboard.metrics_section"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatTile
          icon={Package}
          label="Total terjual"
          value={formatCount(totalSold)}
          tone="primary"
        />
        <StatTile
          icon={TrendingUp}
          label="Target tercapai"
          value={`${percent}%`}
          tone="accent"
        />
        <StatTile
          icon={Flame}
          label="Streak hari"
          value={formatNumber(streak)}
          tone="success"
        />
      </section>

      <section
        aria-labelledby="tip-heading"
        data-ocid="dashboard.tip_card"
        className="animate-fade-up"
      >
        <Card className="rounded-3xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle
              id="tip-heading"
              className="flex items-center gap-2 font-display text-lg"
            >
              <Lightbulb className="size-5 text-primary" aria-hidden="true" />
              Tips Hari Ini
            </CardTitle>
            {tip ? (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                {themeLabel(tip.theme)}
              </span>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {tip ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tip.summary}</p>
                  <p className="rounded-xl bg-primary-soft/60 p-3 text-sm text-primary-deep">
                    <span className="font-semibold">Langkah: </span>
                    {tip.actionStep}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PlatformPill platform={tip.platform} />
                  {tip.done ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={unmarkDone.isPending}
                      data-ocid="dashboard.tip_unmark_button"
                      onClick={() => unmarkDone.mutate(tip.id)}
                      className="rounded-full"
                    >
                      Batalkan
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={markDone.isPending}
                      data-ocid="dashboard.tip_done_button"
                      onClick={() => markDone.mutate(tip.id)}
                      className="rounded-full shadow-primary-glow"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      Tandai Selesai
                    </Button>
                  )}
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

      <section
        aria-labelledby="quiz-heading"
        data-ocid="dashboard.quiz_card"
        className="animate-fade-up"
      >
        <Card className="overflow-hidden rounded-3xl border-transparent bg-gradient-accent text-accent-foreground shadow-elevated">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="quiz-heading"
                  className="font-display text-lg font-bold"
                >
                  Main Kuis Hari Ini
                </h2>
                <p className="mt-0.5 text-sm text-accent-foreground/80">
                  Uji pengetahuan jualanmu dan kumpulkan poin.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              data-ocid="dashboard.quiz_button"
              onClick={() => onNavigate("kuis")}
              className="rounded-full bg-white text-accent hover:bg-white/90"
            >
              Mulai Kuis
            </Button>
          </CardContent>
        </Card>
      </section>

      <section
        aria-labelledby="milestone-heading"
        data-ocid="dashboard.milestone_card"
        className="animate-fade-up"
      >
        <Card className="rounded-3xl border-border/70 shadow-card">
          <CardHeader>
            <CardTitle id="milestone-heading" className="font-display text-lg">
              Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex items-start justify-between gap-1">
              {milestoneRows.map((milestone) => {
                const unlocked = milestone.unlocked;
                return (
                  <li
                    key={milestone.key}
                    className="flex flex-1 flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                        unlocked
                          ? "border-success bg-success text-success-foreground"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {unlocked ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        `${milestone.thresholdPercent}%`
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-tight",
                        unlocked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {milestone.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section
        aria-labelledby="platform-heading"
        data-ocid="dashboard.platform_card"
        className="animate-fade-up"
      >
        <Card className="rounded-3xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle
              id="platform-heading"
              className="flex items-center gap-2 font-display text-lg"
            >
              <Store className="size-5 text-primary" aria-hidden="true" />
              Per Marketplace
            </CardTitle>
            <span className="text-xs text-muted-foreground">barang</span>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformRows.map((row, index) => {
              const width = Math.round(
                (row.quantity / maxPlatformQuantity) * 100,
              );
              return (
                <div
                  key={row.meta.value}
                  data-ocid={`dashboard.platform_row.${index + 1}`}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <PlatformPill platform={row.meta.value} />
                    <span className="font-display text-sm font-bold tabular-nums text-foreground">
                      {formatNumber(row.quantity)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        row.meta.className,
                      )}
                      style={{ width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section
        aria-labelledby="chart-heading"
        data-ocid="dashboard.chart_card"
        className="animate-fade-up"
      >
        <Card className="rounded-3xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle
              id="chart-heading"
              className="flex items-center gap-2 font-display text-lg"
            >
              <BarChart3 className="size-5 text-primary" aria-hidden="true" />
              Jualan 7 hari
            </CardTitle>
            <span className="text-xs text-muted-foreground">barang/hari</span>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-2">
              {chartPoints.map((point, index) => {
                const height = Math.round((point.quantity / maxQuantity) * 100);
                return (
                  <div
                    key={point.day.toString()}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {point.quantity > 0 ? formatNumber(point.quantity) : ""}
                    </span>
                    <div className="flex h-28 w-full items-end">
                      <div
                        data-ocid={`dashboard.chart_bar.${index + 1}`}
                        className="w-full rounded-t-lg bg-gradient-primary transition-[height] duration-700 ease-out"
                        style={{ height: `${Math.max(height, 3)}%` }}
                        title={`${point.label}: ${formatNumber(point.quantity)} barang`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
