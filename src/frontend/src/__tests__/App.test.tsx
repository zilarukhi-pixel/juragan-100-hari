import App from "@/App";
import { createMockBackend, makeProgress, makeTip } from "@/__tests__/harness";
import { Platform } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = createMockBackend();

const authState = {
  isAuthenticated: false,
  isInitializing: false,
  login: vi.fn(),
  clear: vi.fn(),
  loginStatus: "idle" as string,
  loginError: undefined as Error | undefined,
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: backend, isFetching: false }),
  useInternetIdentity: () => authState,
}));

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App shell", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isInitializing = false;
    authState.login = vi.fn();
    authState.clear = vi.fn();
    authState.loginStatus = "idle";
    authState.loginError = undefined;
    backend.getChallenge.mockResolvedValue(null);
    backend.getProgress.mockResolvedValue(null);
    backend.getTodayTip.mockResolvedValue(null);
    backend.listSales.mockResolvedValue([]);
  });

  it("renders the login gate on the default route instead of a blank screen", () => {
    renderApp();
    expect(
      screen.getByRole("button", { name: /masuk dengan internet identity/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jualan 100 Hari")).toBeInTheDocument();
  });

  it("invokes login when the sign-in button is pressed", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(
      screen.getByRole("button", { name: /masuk dengan internet identity/i }),
    );
    expect(authState.login).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state while the identity is initializing", () => {
    authState.isInitializing = true;
    renderApp();
    expect(screen.getByText("Memuat aplikasi…")).toBeInTheDocument();
  });

  it("renders the dashboard with progress, metrics, milestones and the 7-day chart when authenticated", async () => {
    authState.isAuthenticated = true;
    backend.getChallenge.mockResolvedValue({
      startDay: 20260101n,
      createdAt: 1n,
      target: 1_000_000n,
    });
    backend.getProgress.mockResolvedValue(
      makeProgress({
        totalSold: 250_000n,
        percent: 25n,
        dayNumber: 12n,
        daysRemaining: 88n,
        currentStreak: 4n,
        perPlatform: [[Platform.shopee, 250_000n]],
      }),
    );
    backend.getTodayTip.mockResolvedValue(makeTip({ id: 7n }));

    renderApp();

    await waitFor(() =>
      expect(screen.getByText("Hari ke-12 dari 100")).toBeInTheDocument(),
    );
    expect(screen.getByText("Total terjual")).toBeInTheDocument();
    expect(screen.getByText("Target tercapai")).toBeInTheDocument();
    expect(screen.getByText("Streak hari")).toBeInTheDocument();
    expect(screen.getByText("Milestone")).toBeInTheDocument();
    expect(screen.getByText("Jualan 7 hari")).toBeInTheDocument();
    expect(screen.getByText("Tips Hari Ini")).toBeInTheDocument();
  });

  it("shows the logout button once authenticated and returns to the login gate when pressed", async () => {
    authState.isAuthenticated = true;
    backend.getChallenge.mockResolvedValue({
      startDay: 20260101n,
      createdAt: 1n,
      target: 1_000_000n,
    });
    backend.getProgress.mockResolvedValue(makeProgress());

    const user = userEvent.setup();
    renderApp();

    await waitFor(() =>
      expect(screen.getByText("Hari ke-1 dari 100")).toBeInTheDocument(),
    );

    const logout = screen.getByRole("button", { name: /keluar dari akun/i });
    expect(logout).toBeInTheDocument();

    await user.click(logout);
    expect(authState.clear).toHaveBeenCalledTimes(1);
  });

  it("does not show the logout button while unauthenticated", () => {
    renderApp();
    expect(
      screen.queryByRole("button", { name: /keluar dari akun/i }),
    ).not.toBeInTheDocument();
  });

  it("disables the sign-in button and shows progress while logging in", () => {
    authState.loginStatus = "logging-in";
    renderApp();
    const button = screen.getByRole("button", { name: /menghubungkan/i });
    expect(button).toBeDisabled();
  });

  it("surfaces a login error to the user", () => {
    authState.loginError = new Error("Ditolak oleh Internet Identity");
    renderApp();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Gagal masuk: Ditolak oleh Internet Identity",
    );
  });

  it("swaps the login gate for the dashboard when the session becomes authenticated", async () => {
    backend.getChallenge.mockResolvedValue({
      startDay: 20260101n,
      createdAt: 1n,
      target: 1_000_000n,
    });
    backend.getProgress.mockResolvedValue(makeProgress());

    const { rerender } = renderApp();
    expect(
      screen.getByRole("button", { name: /masuk dengan internet identity/i }),
    ).toBeInTheDocument();

    authState.isAuthenticated = true;
    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false, gcTime: 0, staleTime: 0 },
              mutations: { retry: false },
            },
          })
        }
      >
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Hari ke-1 dari 100")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /masuk dengan internet identity/i }),
    ).not.toBeInTheDocument();
  });

  it("navigates between the five main destinations", async () => {
    authState.isAuthenticated = true;
    backend.getChallenge.mockResolvedValue({
      startDay: 20260101n,
      createdAt: 1n,
      target: 1_000_000n,
    });
    backend.getProgress.mockResolvedValue(makeProgress());

    const user = userEvent.setup();
    renderApp();

    await waitFor(() =>
      expect(screen.getByText("Hari ke-1 dari 100")).toBeInTheDocument(),
    );

    await user.click(screen.getByTestId("nav.tips.tab"));
    expect(
      await screen.findByRole("heading", { name: "Tips Jualan" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.kuis.tab"));
    expect(
      await screen.findByRole("heading", { name: "Kuis Harian" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.penjualan.tab"));
    expect(
      await screen.findByRole("heading", { name: "Catat Penjualan" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.favorit.tab"));
    expect(
      await screen.findByRole("heading", { name: "Tips Favorit" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.dashboard.tab"));
    expect(await screen.findByText("Hari ke-1 dari 100")).toBeInTheDocument();
  });
});
