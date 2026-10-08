import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Flame, LogOut, Moon, Sun } from "lucide-react";

interface AppHeaderProps {
  streak: number;
  isAuthenticated: boolean;
  onLogout: () => void;
}

/** Sticky top bar: brand, streak pill, theme toggle, and logout. */
export function AppHeader({
  streak,
  isAuthenticated,
  onLogout,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-primary-glow">
            100
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold leading-tight text-foreground">
              Jualan 100 Hari
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Tantangan 1.000.000 barang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            data-ocid="header.streak_pill"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-gradient-streak px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-primary-glow",
              streak > 0 && "animate-streak-pulse",
            )}
          >
            <Flame className="size-3.5" aria-hidden="true" />
            <span className="tabular-nums">{streak} hari</span>
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
            data-ocid="header.theme_toggle"
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>

          {isAuthenticated ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Keluar dari akun"
              data-ocid="header.logout_button"
              className="rounded-full"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
