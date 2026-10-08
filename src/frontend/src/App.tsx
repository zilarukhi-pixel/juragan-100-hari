import type { NavKey } from "@/components/BottomNav";
import { Layout } from "@/components/Layout";
import { LoginGate } from "@/components/LoginGate";
import { useBackend } from "@/hooks/useBackend";
import { useProgress } from "@/hooks/useChallenge";
import { DashboardPage } from "@/pages/DashboardPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { QuizPage } from "@/pages/QuizPage";
import { SalesPage } from "@/pages/SalesPage";
import { TipsPage } from "@/pages/TipsPage";
import { useCallback, useState } from "react";

export default function App() {
  const [active, setActive] = useState<NavKey>("dashboard");
  const {
    isAuthenticated,
    isInitializing,
    login,
    clear,
    loginStatus,
    loginError,
  } = useBackend();
  const progress = useProgress();

  const handleNavigate = useCallback((key: NavKey) => {
    setActive(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div
          data-ocid="app.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <span className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat aplikasi…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginGate
        onLogin={() => login()}
        isLoggingIn={loginStatus === "logging-in"}
        loginError={loginError}
      />
    );
  }

  const streak = Number(progress.data?.currentStreak ?? 0n);

  return (
    <Layout
      active={active}
      onNavigate={handleNavigate}
      streak={streak}
      isAuthenticated={isAuthenticated}
      onLogout={clear}
    >
      {active === "dashboard" ? (
        <DashboardPage onNavigate={handleNavigate} />
      ) : null}
      {active === "tips" ? <TipsPage /> : null}
      {active === "kuis" ? <QuizPage /> : null}
      {active === "penjualan" ? <SalesPage /> : null}
      {active === "favorit" ? (
        <FavoritesPage onBrowseTips={() => handleNavigate("tips")} />
      ) : null}
    </Layout>
  );
}
