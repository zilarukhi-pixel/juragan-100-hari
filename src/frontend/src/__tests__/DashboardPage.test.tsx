import {
  createMockBackend,
  makeProgress,
  makeSalesEntry,
  makeTip,
} from "@/__tests__/harness";
import { Platform } from "@/backend";
import { DashboardPage } from "@/pages/DashboardPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = createMockBackend();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: backend, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: true,
    isInitializing: false,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "idle",
    loginError: undefined,
  }),
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage onNavigate={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    backend.getChallenge.mockResolvedValue({
      startDay: 20260101n,
      createdAt: 1n,
      target: 1_000_000n,
    });
    backend.getProgress.mockResolvedValue(makeProgress());
    backend.getTodayTip.mockResolvedValue(null);
    backend.listSales.mockResolvedValue([]);
    backend.markTipDone.mockResolvedValue(undefined);
    backend.unmarkTipDone.mockResolvedValue(undefined);
  });

  it("shows the progress card, three metrics, milestones and the 7-day chart", async () => {
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

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByText("Hari ke-12 dari 100")).toBeInTheDocument(),
    );
    expect(screen.getAllByText("25%").length).toBeGreaterThan(0);
    expect(screen.getByText("Total terjual")).toBeInTheDocument();
    expect(screen.getByText("Target tercapai")).toBeInTheDocument();
    expect(screen.getByText("Streak hari")).toBeInTheDocument();
    expect(screen.getByText("Milestone")).toBeInTheDocument();
    expect(screen.getByText("Jualan 7 hari")).toBeInTheDocument();
    // Seven chart bars, one per day of the week window.
    expect(screen.getByTestId("dashboard.chart_bar.1")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.chart_bar.7")).toBeInTheDocument();
  });

  it("renders the 7-day chart from the sales returned for the week window", async () => {
    const today = new Date();
    const dayKey = BigInt(
      `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate(),
      ).padStart(2, "0")}`,
    );
    backend.listSales.mockResolvedValue([
      makeSalesEntry({ day: dayKey, quantity: 1_000n }),
    ]);

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByText("Hari ke-1 dari 100")).toBeInTheDocument(),
    );
    // The chart bar for today carries the recorded quantity in its title.
    const bars = screen.getAllByTitle(/barang/);
    expect(
      bars.some((bar) => bar.getAttribute("title")?.includes("1.000")),
    ).toBe(true);
  });

  it("marks today's tip done and swaps the button to the undo action", async () => {
    backend.getTodayTip.mockResolvedValue(makeTip({ id: 42n, done: false }));

    const user = userEvent.setup();
    renderDashboard();

    const doneButton = await screen.findByTestId("dashboard.tip_done_button");
    await user.click(doneButton);

    expect(backend.markTipDone).toHaveBeenCalledWith(42n);
  });

  it("shows the undo action when today's tip is already done", async () => {
    backend.getTodayTip.mockResolvedValue(makeTip({ id: 42n, done: true }));

    renderDashboard();

    expect(
      await screen.findByTestId("dashboard.tip_unmark_button"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("dashboard.tip_done_button"),
    ).not.toBeInTheDocument();
  });

  it("offers to start the challenge when none exists yet", async () => {
    backend.getChallenge.mockResolvedValue(null);
    backend.getProgress.mockResolvedValue(null);

    const user = userEvent.setup();
    renderDashboard();

    const startButton = await screen.findByTestId(
      "dashboard.start_challenge_button",
    );
    await user.click(startButton);

    expect(backend.startChallenge).toHaveBeenCalledTimes(1);
    const [target] = backend.startChallenge.mock.calls[0] as [bigint, bigint];
    expect(target).toBe(1_000_000n);
  });
});
