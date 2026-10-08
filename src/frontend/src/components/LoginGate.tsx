import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck, Sparkles, Target } from "lucide-react";

interface LoginGateProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  loginError?: Error;
}

const HIGHLIGHTS = [
  {
    icon: Target,
    title: "Tantangan 100 hari",
    body: "Catat penjualan harian dan kejar target 1.000.000 barang.",
  },
  {
    icon: Sparkles,
    title: "Tips & kuis harian",
    body: "Satu tips praktis dan kuis singkat setiap hari untuk seller.",
  },
  {
    icon: ShieldCheck,
    title: "Data aman per akun",
    body: "Progres tersimpan di Internet Identity milikmu sendiri.",
  },
];

/** Full-screen sign-in gate shown before the app is usable. */
export function LoginGate({
  onLogin,
  isLoggingIn,
  loginError,
}: LoginGateProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background bg-grain px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-gradient-primary font-display text-xl font-bold text-primary-foreground shadow-primary-glow">
            100
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground">
            Jualan 100 Hari
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tantangan 100 hari menuju 1.000.000 barang terjual untuk seller
            Shopee, TikTok Shop, dan Lazada.
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <Button
          type="button"
          size="lg"
          onClick={onLogin}
          disabled={isLoggingIn}
          data-ocid="login.submit_button"
          className="mt-8 h-12 w-full rounded-full text-base font-semibold shadow-primary-glow"
        >
          <LogIn className="size-4" aria-hidden="true" />
          {isLoggingIn ? "Menghubungkan…" : "Masuk dengan Internet Identity"}
        </Button>

        {loginError ? (
          <p
            role="alert"
            data-ocid="login.error_state"
            className="mt-3 text-center text-sm text-destructive"
          >
            Gagal masuk: {loginError.message}
          </p>
        ) : null}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dengan masuk, progres tantanganmu tersimpan aman dan bisa diakses
          kembali kapan saja.
        </p>
      </div>
    </div>
  );
}
