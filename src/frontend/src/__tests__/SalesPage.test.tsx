import { createMockBackend, makeSalesEntry } from "@/__tests__/harness";
import { Platform } from "@/backend";
import { SalesPage } from "@/pages/SalesPage";
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

function renderSales() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SalesPage />
    </QueryClientProvider>,
  );
}

describe("SalesPage", () => {
  beforeEach(() => {
    backend.listSales.mockResolvedValue([]);
    backend.recordSales.mockResolvedValue(
      makeSalesEntry({ platform: Platform.shopee, quantity: 1_000n }),
    );
  });

  it("records 1.000 barang on Shopee through the backend", async () => {
    const user = userEvent.setup();
    renderSales();

    await user.type(screen.getByTestId("penjualan.quantity_input"), "1000");
    await user.click(screen.getByTestId("penjualan.submit_button"));

    await waitFor(() => expect(backend.recordSales).toHaveBeenCalledTimes(1));
    const [day, quantity, platform] = backend.recordSales.mock.calls[0] as [
      bigint,
      bigint,
      Platform,
    ];
    expect(quantity).toBe(1_000n);
    expect(platform).toBe(Platform.shopee);
    expect(typeof day).toBe("bigint");
  });

  it("shows the aggregate total and per-platform breakdown from the sales list", async () => {
    backend.listSales.mockResolvedValue([
      makeSalesEntry({ platform: Platform.shopee, quantity: 1_000n }),
      makeSalesEntry({ platform: Platform.lazada, quantity: 500n }),
    ]);

    renderSales();

    expect(
      await screen.findByText("Total barang (terfilter)"),
    ).toBeInTheDocument();
    // 1.000 + 500 aggregated across the filtered entries.
    expect(await screen.findByText("1.500")).toBeInTheDocument();
    expect(screen.getByTestId("penjualan.breakdown.shopee")).toHaveTextContent(
      "1.000",
    );
    expect(screen.getByTestId("penjualan.breakdown.lazada")).toHaveTextContent(
      "500",
    );
  });

  it("rejects an invalid quantity without calling the backend", async () => {
    const user = userEvent.setup();
    renderSales();

    await user.type(screen.getByTestId("penjualan.quantity_input"), "0");
    await user.click(screen.getByTestId("penjualan.submit_button"));

    expect(
      await screen.findByTestId("penjualan.error_state"),
    ).toHaveTextContent(/jumlah barang yang valid/i);
    expect(backend.recordSales).not.toHaveBeenCalled();
  });

  it("passes the date range to the backend when the filter changes", async () => {
    const user = userEvent.setup();
    renderSales();

    await screen.findByText("Riwayat Penjualan");
    await user.type(
      screen.getByTestId("penjualan.filter.from_input"),
      "2026-01-01",
    );

    await waitFor(() =>
      expect(backend.listSales).toHaveBeenCalledWith(null, 20260101n, null),
    );
  });

  it("shows an empty state when there are no sales", async () => {
    renderSales();

    expect(
      await screen.findByText("Belum ada penjualan tercatat"),
    ).toBeInTheDocument();
  });
});
