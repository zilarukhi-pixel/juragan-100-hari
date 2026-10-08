import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PlatformPill } from "@/components/PlatformPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useFavorites,
  useMarkTipDone,
  useRemoveFavorite,
  useUnmarkTipDone,
} from "@/hooks/useChallenge";
import { formatDayKey } from "@/lib/day";
import { themeLabel } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { Check, Heart, Lightbulb, Trash2 } from "lucide-react";

interface FavoritesPageProps {
  /** Navigate to the Tips page so the user can save more tips. */
  onBrowseTips?: () => void;
}

export function FavoritesPage({ onBrowseTips }: FavoritesPageProps) {
  const favorites = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const markDone = useMarkTipDone();
  const unmarkDone = useUnmarkTipDone();

  const items = favorites.data ?? [];
  const doneCount = items.filter((tip) => tip.done).length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Tips Favorit
        </h1>
        <p className="text-sm text-muted-foreground">
          Tips yang kamu simpan untuk dibaca dan dikerjakan lagi nanti.
        </p>
      </header>

      {favorites.isLoading ? (
        <LoadingState count={3} />
      ) : favorites.isError ? (
        <EmptyState
          icon={Heart}
          title="Gagal memuat favorit"
          description="Terjadi kendala saat mengambil tips favoritmu. Coba muat ulang halaman ini."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void favorites.refetch()}
              data-ocid="favorit.retry_button"
              className="rounded-full"
            >
              Coba lagi
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Belum ada tips favorit"
          description="Buka halaman Tips dan tekan ikon hati untuk menyimpan tips ke sini."
          action={
            onBrowseTips ? (
              <Button
                type="button"
                onClick={onBrowseTips}
                data-ocid="favorit.browse_tips_button"
                className="rounded-full"
              >
                <Lightbulb className="size-4" aria-hidden="true" />
                Jelajahi Tips
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-ocid="favorit.count"
              className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-deep"
            >
              {items.length} tips tersimpan
            </span>
            {doneCount > 0 ? (
              <span
                data-ocid="favorit.done_count"
                className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success"
              >
                {doneCount} selesai
              </span>
            ) : null}
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((tip, index) => (
              <li key={tip.id.toString()}>
                <Card
                  data-ocid={`favorit.item.${index + 1}`}
                  className="h-full rounded-2xl border-border/70 shadow-subtle"
                >
                  <CardContent className="flex h-full flex-col gap-3 pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                        {themeLabel(tip.theme)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFavorite.mutate(tip.id)}
                        disabled={removeFavorite.isPending}
                        aria-label="Hapus dari favorit"
                        data-ocid={`favorit.remove_button.${index + 1}`}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-2">
                      <h2 className="font-display text-base font-semibold text-foreground">
                        {tip.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {tip.summary}
                      </p>
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
                        disabled={markDone.isPending || unmarkDone.isPending}
                        onClick={() =>
                          tip.done
                            ? unmarkDone.mutate(tip.id)
                            : markDone.mutate(tip.id)
                        }
                        data-ocid={`favorit.done_button.${index + 1}`}
                        className={cn(
                          "rounded-full",
                          tip.done && "text-success",
                        )}
                      >
                        {tip.done ? (
                          <>
                            <Check className="size-3.5" aria-hidden="true" />
                            Selesai
                          </>
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
