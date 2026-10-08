import { createMockBackend, makeTip } from "@/__tests__/harness";
import { Platform, TipTheme } from "@/backend";
import { TipsPage } from "@/pages/TipsPage";
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

function renderTips() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TipsPage />
    </QueryClientProvider>,
  );
}

const shopeeTip = makeTip({
  id: 1n,
  title: "Optimalkan judul listing",
  summary: "Judul yang jelas menaikkan klik.",
  platform: Platform.shopee,
  theme: TipTheme.listing,
});

const lazadaTip = makeTip({
  id: 2n,
  title: "Balas chat pelanggan cepat",
  summary: "Respons cepat menaikkan rating.",
  platform: Platform.lazada,
  theme: TipTheme.layananPelanggan,
});

describe("TipsPage", () => {
  beforeEach(() => {
    backend.getTodayTip.mockResolvedValue(null);
    backend.listTips.mockResolvedValue([shopeeTip, lazadaTip]);
    backend.listFavorites.mockResolvedValue([]);
    backend.markTipDone.mockResolvedValue(undefined);
    backend.unmarkTipDone.mockResolvedValue(undefined);
    backend.addFavorite.mockResolvedValue(undefined);
    backend.removeFavorite.mockResolvedValue(undefined);
  });

  it("lists tips and filters by search text", async () => {
    const user = userEvent.setup();
    renderTips();

    expect(
      await screen.findByText("Optimalkan judul listing"),
    ).toBeInTheDocument();
    expect(screen.getByText("Balas chat pelanggan cepat")).toBeInTheDocument();

    await user.type(screen.getByTestId("tips.search_input"), "judul");

    expect(screen.getByText("Optimalkan judul listing")).toBeInTheDocument();
    expect(
      screen.queryByText("Balas chat pelanggan cepat"),
    ).not.toBeInTheDocument();
  });

  it("requests tips filtered by platform when a platform chip is selected", async () => {
    const user = userEvent.setup();
    renderTips();

    await screen.findByText("Optimalkan judul listing");
    await user.click(screen.getByTestId("tips.platform.lazada.tab"));

    await waitFor(() =>
      expect(backend.listTips).toHaveBeenCalledWith(
        null,
        Platform.lazada,
        null,
      ),
    );
  });

  it("requests tips filtered by theme when a theme chip is selected", async () => {
    const user = userEvent.setup();
    renderTips();

    await screen.findByText("Optimalkan judul listing");
    await user.click(screen.getByTestId("tips.theme.promosi.tab"));

    await waitFor(() =>
      expect(backend.listTips).toHaveBeenCalledWith(
        null,
        null,
        TipTheme.promosi,
      ),
    );
  });

  it("marks a tip done through the backend", async () => {
    const user = userEvent.setup();
    renderTips();

    await screen.findByText("Optimalkan judul listing");
    await user.click(screen.getByTestId("tips.done_button.1"));

    expect(backend.markTipDone).toHaveBeenCalledWith(1n);
  });

  it("adds a tip to favorites through the backend", async () => {
    const user = userEvent.setup();
    renderTips();

    await screen.findByText("Optimalkan judul listing");
    await user.click(screen.getByTestId("tips.favorite_button.1"));

    expect(backend.addFavorite).toHaveBeenCalledWith(1n);
  });

  it("shows an empty state when no tip matches the search", async () => {
    const user = userEvent.setup();
    renderTips();

    await screen.findByText("Optimalkan judul listing");
    await user.type(screen.getByTestId("tips.search_input"), "zzz-tidak-ada");

    expect(
      await screen.findByText("Belum ada tips yang cocok"),
    ).toBeInTheDocument();
  });
});
