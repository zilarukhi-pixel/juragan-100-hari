import {
  createMockBackend,
  makeQuestion,
  makeQuizResult,
  makeSubmission,
} from "@/__tests__/harness";
import { QuizPage } from "@/pages/QuizPage";
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

function renderQuiz() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QuizPage />
    </QueryClientProvider>,
  );
}

describe("QuizPage", () => {
  beforeEach(() => {
    backend.getTodayQuiz.mockResolvedValue([
      makeQuestion({ id: 1n, prompt: "Pertanyaan satu?", options: ["A", "B"] }),
      makeQuestion({ id: 2n, prompt: "Pertanyaan dua?", options: ["C", "D"] }),
    ]);
    backend.listQuizHistory.mockResolvedValue([]);
    backend.submitQuiz.mockResolvedValue(
      makeSubmission({
        total: 2n,
        score: 1n,
        points: 10n,
        feedback: [
          {
            questionId: 1n,
            correctIndex: 1n,
            chosenIndex: 1n,
            correct: true,
            explanation: "Tepat sekali.",
          },
          {
            questionId: 2n,
            correctIndex: 0n,
            chosenIndex: 1n,
            correct: false,
            explanation: "Coba lagi.",
          },
        ],
      }),
    );
  });

  it("keeps submit disabled until every question is answered", async () => {
    const user = userEvent.setup();
    renderQuiz();

    const submit = await screen.findByTestId("kuis.submit_button");
    expect(submit).toBeDisabled();

    await user.click(screen.getByTestId("kuis.option.1.2"));
    expect(submit).toBeDisabled();

    await user.click(screen.getByTestId("kuis.option.2.2"));
    expect(submit).toBeEnabled();
  });

  it("submits answers and shows per-question benar/salah feedback", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await screen.findByTestId("kuis.submit_button");
    await user.click(screen.getByTestId("kuis.option.1.2"));
    await user.click(screen.getByTestId("kuis.option.2.2"));
    await user.click(screen.getByTestId("kuis.submit_button"));

    await waitFor(() =>
      expect(backend.submitQuiz).toHaveBeenCalledWith([
        [1n, 1n],
        [2n, 1n],
      ]),
    );

    expect(await screen.findByText("Skor kamu: 1/2")).toBeInTheDocument();
    expect(screen.getByText("Benar")).toBeInTheDocument();
    expect(screen.getByText("Salah")).toBeInTheDocument();
    expect(screen.getByText("Tepat sekali.")).toBeInTheDocument();
    expect(screen.getByText("Coba lagi.")).toBeInTheDocument();
  });

  it("renders the quiz history with score and points", async () => {
    backend.listQuizHistory.mockResolvedValue([
      makeQuizResult({ day: 20260101n, score: 2n, total: 2n, points: 20n }),
    ]);

    renderQuiz();

    expect(await screen.findByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("20 poin")).toBeInTheDocument();
  });

  it("shows an empty state when there is no quiz today", async () => {
    backend.getTodayQuiz.mockResolvedValue([]);

    renderQuiz();

    expect(
      await screen.findByText("Belum ada kuis hari ini"),
    ).toBeInTheDocument();
  });
});
