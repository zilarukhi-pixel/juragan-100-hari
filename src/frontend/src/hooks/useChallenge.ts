import { createActor } from "@/backend";
import type {
  Challenge,
  ChallengeProgress,
  DayKey,
  Platform,
  QuizQuestionView,
  QuizResult,
  QuizSubmission,
  SalesEntry,
  TipTheme,
  TipView,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  challenge: ["challenge"] as const,
  progress: ["progress"] as const,
  todayTip: ["todayTip"] as const,
  tips: (platform: Platform | null, theme: TipTheme | null) =>
    ["tips", platform, theme] as const,
  favorites: ["favorites"] as const,
  todayQuiz: ["todayQuiz"] as const,
  quizHistory: ["quizHistory"] as const,
  sales: (
    platform: Platform | null,
    fromDay: DayKey | null,
    toDay: DayKey | null,
  ) => ["sales", platform, fromDay, toDay] as const,
};

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

export function useChallenge() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Challenge | null>({
    queryKey: queryKeys.challenge,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChallenge();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProgress() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ChallengeProgress | null>({
    queryKey: queryKeys.progress,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartChallenge() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { target: bigint; startDay: DayKey }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.startChallenge(args.target, args.startDay);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenge });
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Tips                                                                */
/* ------------------------------------------------------------------ */

export function useTodayTip() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TipView | null>({
    queryKey: queryKeys.todayTip,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTodayTip();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTips(platform: Platform | null, theme: TipTheme | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TipView[]>({
    queryKey: queryKeys.tips(platform, theme),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTips(null, platform, theme);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TipView[]>({
    queryKey: queryKeys.favorites,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFavorites();
    },
    enabled: !!actor && !isFetching,
  });
}

function useTipInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.todayTip });
    void queryClient.invalidateQueries({ queryKey: ["tips"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
  };
}

export function useMarkTipDone() {
  const { actor } = useActor(createActor);
  const invalidate = useTipInvalidation();
  return useMutation({
    mutationFn: async (tipId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.markTipDone(tipId);
    },
    onSuccess: invalidate,
  });
}

export function useUnmarkTipDone() {
  const { actor } = useActor(createActor);
  const invalidate = useTipInvalidation();
  return useMutation({
    mutationFn: async (tipId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.unmarkTipDone(tipId);
    },
    onSuccess: invalidate,
  });
}

export function useAddFavorite() {
  const { actor } = useActor(createActor);
  const invalidate = useTipInvalidation();
  return useMutation({
    mutationFn: async (tipId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addFavorite(tipId);
    },
    onSuccess: invalidate,
  });
}

export function useRemoveFavorite() {
  const { actor } = useActor(createActor);
  const invalidate = useTipInvalidation();
  return useMutation({
    mutationFn: async (tipId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.removeFavorite(tipId);
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

export function useTodayQuiz() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<QuizQuestionView[]>({
    queryKey: queryKeys.todayQuiz,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayQuiz();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuizHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<QuizResult[]>({
    queryKey: queryKeys.quizHistory,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listQuizHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitQuiz() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<QuizSubmission, Error, Array<[bigint, bigint]>>({
    mutationFn: async (answers) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.submitQuiz(answers);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quizHistory });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Sales                                                               */
/* ------------------------------------------------------------------ */

export function useSales(
  platform: Platform | null,
  fromDay: DayKey | null,
  toDay: DayKey | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SalesEntry[]>({
    queryKey: queryKeys.sales(platform, fromDay, toDay),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSales(platform, fromDay, toDay);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordSales() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      day: DayKey;
      quantity: bigint;
      platform: Platform;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.recordSales(args.day, args.quantity, args.platform);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress });
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenge });
    },
  });
}
