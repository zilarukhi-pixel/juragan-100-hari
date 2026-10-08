import { AppHeader } from "@/components/AppHeader";
import { BottomNav, NAV_ITEMS, type NavKey } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LayoutProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  streak: number;
  isAuthenticated: boolean;
  onLogout: () => void;
  children: ReactNode;
}

/** App shell: header, desktop sidebar, mobile bottom nav, and footer. */
export function Layout({
  active,
  onNavigate,
  streak,
  isAuthenticated,
  onLogout,
  children,
}: LayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        streak={streak}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 pb-24 pt-6 sm:px-6 md:pb-10">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav
            aria-label="Navigasi utama"
            className="sticky top-24 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  data-ocid={`sidebar.${item.key}.tab`}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-primary-glow"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border bg-card px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>Jualan 100 Hari — tantangan seller marketplace Indonesia.</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>

      <BottomNav active={active} onNavigate={onNavigate} />
    </div>
  );
}
