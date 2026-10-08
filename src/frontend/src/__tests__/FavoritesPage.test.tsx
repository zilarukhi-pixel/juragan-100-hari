import { createMockBackend, makeTip } from "@/__tests__/harness";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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

function renderFavorites(onBrowseTips?: () => void) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FavoritesPage onBrowseTips={onBrowseTips} />
    </QueryClientProvider>,
  );
}

describe("FavoritesPage", () => {
  beforeEach(() => {
    backend.listFavorites.mockResolvedValue([]);
    backend.removeFavorite.mockResolvedValue(undefined);
    backend.markTipDone.mockResolvedValue(undefined);
    backend.unmarkTipDone.mockResolvedValue(undefined);
  });

  it("shows an empty state and navigates to tips when browsing", async () => {
    const onBrowseTips = vi.fn();
    const user = userEvent.setup();
    renderFavorites(onBrowseTips);

    expect(
      await screen.findByText("Belum ada tips favorit"),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("favorit.browse_tips_button"));
    expect(onBrowseTips).toHaveBeenCalledTimes(1);
  });

  it("lists saved favorites and removes one through the backend", async () => {
    backend.listFavorites.mockResolvedValue([
      makeTip({ id: 5n, title: "Tips favorit saya", favorite: true }),
    ]);

    const user = userEvent.setup();
    renderFavorites();

    expect(await screen.findByText("Tips favorit saya")).toBeInTheDocument();
    expect(screen.getByTestId("favorit.count")).toHaveTextContent(
      "1 tips tersimpan",
    );

    await user.click(screen.getByTestId("favorit.remove_button.1"));
    expect(backend.removeFavorite).toHaveBeenCalledWith(5n);
  });

  it("marks a favorite tip done through the backend", async () => {
    backend.listFavorites.mockResolvedValue([
      makeTip({
        id: 9n,
        title: "Tips favorit saya",
        favorite: true,
        done: false,
      }),
    ]);

    const user = userEvent.setup();
    renderFavorites();

    await screen.findByText("Tips favorit saya");
    await user.click(screen.getByTestId("favorit.done_button.1"));
    expect(backend.markTipDone).toHaveBeenCalledWith(9n);
  });
});
