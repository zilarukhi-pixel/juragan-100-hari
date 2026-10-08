import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useQuizHistory,
  useSubmitQuiz,
  useTodayQuiz,
} from "@/hooks/useChallenge";
import { formatDayKey } from "@/lib/day";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuizAnswerFeedback, QuizSubmission } from "@/types";
import { BookOpen, Check, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import { useState } from "react";

export function QuizPage() {
  const quiz = useTodayQuiz();
  const history = useQuizHistory();
  const submit = useSubmitQuiz();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizSubmission | null>(null);

  const questions = quiz.data ?? [];
  const answeredCount = questions.filter(
    (q) => answers[q.id.toString()] !== undefined,
  ).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const payload: Array<[bigint, bigint]> = questions.map((q) => [
      q.id,
      BigInt(answers[q.id.toString()]),
    ]);
    submit.mutate(payload, {
      onSuccess: (data) => setResult(data),
    });
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Kuis Harian
        </h1>
        <p className="text-sm text-muted-foreground">
          Jawab kuis singkat setiap hari dan kumpulkan poin.
        </p>
      </header>

      {quiz.isLoading ? (
        <LoadingState count={2} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada kuis hari ini"
          description="Kuis baru tersedia setiap hari. Kembali lagi besok untuk menguji pengetahuan jualanmu."
        />
      ) : result ? (
        <QuizResultCard result={result} onReset={handleReset} />
      ) : (
        <Card className="overflow-hidden rounded-3xl border-border/70 shadow-card">
          <CardHeader className="gap-3 border-b border-border/60 bg-accent-soft/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-accent text-accent-foreground">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="font-display text-lg">
                    Kuis Hari Ini
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {questions.length} pertanyaan · pilihan ganda
                  </p>
                </div>
              </div>
              <span
                data-ocid="kuis.progress_state"
                className="rounded-full bg-card px-3 py-1 text-xs font-semibold tabular-nums text-accent"
              >
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-card"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-gradient-accent transition-smooth"
                style={{
                  width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {questions.map((question, qIndex) => {
              const selected = answers[question.id.toString()];
              return (
                <fieldset
                  key={question.id.toString()}
                  className="space-y-3"
                  data-ocid={`kuis.question.${qIndex + 1}`}
                >
                  <legend className="text-sm font-semibold text-foreground">
                    {qIndex + 1}. {question.prompt}
                  </legend>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = selected === oIndex;
                      return (
                        <label
                          key={`${question.id.toString()}-${oIndex}`}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-smooth",
                            isSelected
                              ? "border-accent bg-accent-soft/60 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-accent/40",
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id.toString()}`}
                            value={oIndex}
                            checked={isSelected}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [question.id.toString()]: oIndex,
                              }))
                            }
                            data-ocid={`kuis.option.${qIndex + 1}.${oIndex + 1}`}
                            className="size-4 accent-[oklch(var(--accent))]"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            {submit.isError ? (
              <p
                role="alert"
                data-ocid="kuis.error_state"
                className="text-sm text-destructive"
              >
                Gagal mengirim jawaban: {submit.error.message}
              </p>
            ) : null}

            <Button
              type="button"
              size="lg"
              disabled={!allAnswered || submit.isPending}
              onClick={handleSubmit}
              data-ocid="kuis.submit_button"
              className="w-full rounded-full bg-gradient-accent text-accent-foreground shadow-accent-glow hover:opacity-95"
            >
              {submit.isPending ? "Mengirim…" : "Kirim Jawaban"}
            </Button>
            {!allAnswered ? (
              <p className="text-center text-xs text-muted-foreground">
                Jawab semua pertanyaan untuk mengirim.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="history-heading" className="space-y-3">
        <h2
          id="history-heading"
          className="font-display text-lg font-bold text-foreground"
        >
          Riwayat Kuis
        </h2>
        {history.isLoading ? (
          <LoadingState count={2} />
        ) : (history.data ?? []).length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Belum ada riwayat kuis"
            description="Skor kuis yang kamu kerjakan akan muncul di sini."
          />
        ) : (
          <ul className="space-y-2">
            {(history.data ?? []).map((entry, index) => {
              const score = Number(entry.score);
              const total = Number(entry.total);
              const perfect = total > 0 && score === total;
              return (
                <li
                  key={`${entry.day.toString()}-${index}`}
                  data-ocid={`kuis.history.item.${index + 1}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDayKey(entry.day)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(entry.completedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {Number(entry.points)} poin
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                        perfect
                          ? "bg-success-soft text-success"
                          : "bg-accent-soft text-accent",
                      )}
                    >
                      {score}/{total}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

interface QuizResultCardProps {
  result: QuizSubmission;
  onReset: () => void;
}

function QuizResultCard({ result, onReset }: QuizResultCardProps) {
  const score = Number(result.score);
  const total = Number(result.total);
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const perfect = total > 0 && score === total;

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 shadow-card">
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-accent text-accent-foreground">
            <Trophy className="size-7" aria-hidden="true" />
          </span>
          <h2 className="font-display text-xl font-bold text-foreground">
            Skor kamu: {score}/{total}
          </h2>
          <p className="text-sm text-muted-foreground">
            {percent}% benar · {Number(result.points)} poin
          </p>
          {perfect ? (
            <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
              Sempurna! Semua jawaban benar
            </span>
          ) : null}
        </div>

        <ul className="space-y-3">
          {result.feedback.map((item, index) => (
            <FeedbackItem
              key={item.questionId.toString()}
              item={item}
              index={index}
            />
          ))}
        </ul>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          data-ocid="kuis.retry_button"
          className="w-full rounded-full"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Kerjakan Ulang
        </Button>
      </CardContent>
    </Card>
  );
}

interface FeedbackItemProps {
  item: QuizAnswerFeedback;
  index: number;
}

function FeedbackItem({ item, index }: FeedbackItemProps) {
  return (
    <li
      data-ocid={`kuis.feedback.item.${index + 1}`}
      className={cn(
        "rounded-2xl border p-4",
        item.correct
          ? "border-success/40 bg-success-soft/50"
          : "border-destructive/40 bg-destructive-soft/50",
      )}
    >
      <div className="flex items-center gap-2">
        {item.correct ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <X className="size-4 text-destructive" aria-hidden="true" />
        )}
        <span
          className={cn(
            "text-sm font-semibold",
            item.correct ? "text-success" : "text-destructive",
          )}
        >
          {item.correct ? "Benar" : "Salah"}
        </span>
      </div>
      {!item.correct ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Jawaban benar: pilihan ke-{Number(item.correctIndex) + 1}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-foreground">{item.explanation}</p>
    </li>
  );
}
