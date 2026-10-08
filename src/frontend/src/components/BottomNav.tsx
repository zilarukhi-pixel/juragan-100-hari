import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Heart,
  LayoutDashboard,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavKey = "dashboard" | "tips" | "kuis" | "penjualan" | "favorit";

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tips", label: "Tips", icon: Lightbulb },
  { key: "kuis", label: "Kuis", icon: BookOpen },
  { key: "penjualan", label: "Penjualan", icon: BarChart3 },
  { key: "favorit", label: "Favorit", icon: Heart },
];

interface BottomNavProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}

/** Mobile bottom navigation with five destinations. */
export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={isActive ? "page" : undefined}
                data-ocid={`nav.${item.key}.tab`}
                className={cn(
                  "flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-5", isActive && "stroke-[2.4]")}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
