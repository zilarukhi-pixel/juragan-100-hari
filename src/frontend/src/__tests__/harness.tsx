import type {
  Challenge,
  ChallengeProgress,
  Platform,
  QuizQuestionView,
  QuizResult,
  QuizSubmission,
  SalesEntry,
  TipTheme,
  TipView,
} from "@/backend";
import { Platform as PlatformEnum, TipTheme as TipThemeEnum } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated `Backend` actor. Every method the
 * app calls is present so a missing implementation surfaces as a test failure
 * rather than an undefined-property crash. Tests override only what they need.
 */
export interface MockBackend {
  getChallenge: ReturnType<typeof vi.fn>;
  getProgress: ReturnType<typeof vi.fn>;
  startChallenge: ReturnType<typeof vi.fn>;
  getTodayTip: ReturnType<typeof vi.fn>;
  listTips: ReturnType<typeof vi.fn>;
  listFavorites: ReturnType<typeof vi.fn>;
  markTipDone: ReturnType<typeof vi.fn>;
  unmarkTipDone: ReturnType<typeof vi.fn>;
  addFavorite: ReturnType<typeof vi.fn>;
  removeFavorite: ReturnType<typeof vi.fn>;
  getTodayQuiz: ReturnType<typeof vi.fn>;
  listQuizHistory: ReturnType<typeof vi.fn>;
  submitQuiz: ReturnType<typeof vi.fn>;
  listSales: ReturnType<typeof vi.fn>;
  recordSales: ReturnType<typeof vi.fn>;
}

export function createMockBackend(
  overrides: Partial<MockBackend> = {},
): MockBackend {
  const base: MockBackend = {
    getChallenge: vi.fn(async () => null),
    getProgress: vi.fn(async () => null),
    startChallenge: vi.fn(async () => makeChallenge()),
    getTodayTip: vi.fn(async () => null),
    listTips: vi.fn(async () => []),
    listFavorites: vi.fn(async () => []),
    markTipDone: vi.fn(async () => undefined),
    unmarkTipDone: vi.fn(async () => undefined),
    addFavorite: vi.fn(async () => undefined),
    removeFavorite: vi.fn(async () => undefined),
    getTodayQuiz: vi.fn(async () => []),
    listQuizHistory: vi.fn(async () => []),
    submitQuiz: vi.fn(async () => makeSubmission()),
    listSales: vi.fn(async () => []),
    recordSales: vi.fn(async () => makeSalesEntry()),
  };
  return { ...base, ...overrides };
}

export function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    startDay: 20260101n,
    createdAt: 1_700_000_000_000_000_000n,
    target: 1_000_000n,
    ...overrides,
  };
}

export function makeProgress(
  overrides: Partial<ChallengeProgress> = {},
): ChallengeProgress {
  return {
    totalSold: 0n,
    perPlatform: [],
    percent: 0n,
    target: 1_000_000n,
    dayNumber: 1n,
    daysRemaining: 99n,
    currentStreak: 0n,
    milestones: [],
    ...overrides,
  };
}

export function makeTip(overrides: Partial<TipView> = {}): TipView {
  return {
    id: 1n,
    day: 20260101n,
    theme: TipThemeEnum.listing,
    title: "Optimalkan judul listing",
    done: false,
    actionStep: "Tambahkan kata kunci utama di 60 karakter pertama.",
    platform: PlatformEnum.shopee,
    summary: "Judul yang jelas menaikkan klik.",
    favorite: false,
    ...overrides,
  };
}

export function makeQuestion(
  overrides: Partial<QuizQuestionView> = {},
): QuizQuestionView {
  return {
    id: 1n,
    prompt: "Apa metrik utama konversi?",
    options: ["Klik", "Pembelian", "Impresi"],
    ...overrides,
  };
}

export function makeSubmission(
  overrides: Partial<QuizSubmission> = {},
): QuizSubmission {
  return {
    day: 20260101n,
    total: 1n,
    score: 1n,
    points: 10n,
    feedback: [
      {
        questionId: 1n,
        correctIndex: 1n,
        chosenIndex: 1n,
        correct: true,
        explanation: "Pembelian adalah konversi.",
      },
    ],
    ...overrides,
  };
}

export function makeQuizResult(
  overrides: Partial<QuizResult> = {},
): QuizResult {
  return {
    day: 20260101n,
    completedAt: 1_700_000_000_000_000_000n,
    total: 1n,
    score: 1n,
    points: 10n,
    ...overrides,
  };
}

export function makeSalesEntry(
  overrides: Partial<SalesEntry> = {},
): SalesEntry {
  return {
    day: 20260101n,
    platform: PlatformEnum.shopee,
    updatedAt: 1_700_000_000_000_000_000n,
    quantity: 0n,
    ...overrides,
  };
}

export interface RenderOptions {
  actor?: MockBackend | null;
  isAuthenticated?: boolean;
  isInitializing?: boolean;
  login?: () => void;
  clear?: () => void;
  loginStatus?: string;
  loginError?: Error;
}

/**
 * Render a component inside a fresh QueryClient. The core-infrastructure hooks
 * are mocked at the module level by each test file; this helper only supplies
 * the React Query provider the app's data hooks require.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  void options;
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

export { PlatformEnum as Platform, TipThemeEnum as TipTheme };
export type { Platform as PlatformType, TipTheme as TipThemeType };
