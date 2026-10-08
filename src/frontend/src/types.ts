import type {
  Challenge,
  ChallengeProgress,
  DayKey,
  Milestone,
  Platform,
  QuizAnswerFeedback,
  QuizQuestionView,
  QuizResult,
  QuizSubmission,
  SalesEntry,
  TipTheme,
  TipView,
} from "@/backend";

export type {
  Challenge,
  ChallengeProgress,
  DayKey,
  Milestone,
  Platform,
  QuizAnswerFeedback,
  QuizQuestionView,
  QuizResult,
  QuizSubmission,
  SalesEntry,
  TipTheme,
  TipView,
};

/** The 100-day challenge target: 1.000.000 barang. */
export const CHALLENGE_TARGET = 1_000_000n;
export const CHALLENGE_DAYS = 100;

export interface PlatformMeta {
  value: Platform;
  label: string;
  /** Short label for compact pills. */
  short: string;
  /** Tailwind classes for the pill surface. */
  className: string;
}

export interface ThemeMeta {
  value: TipTheme;
  label: string;
  className: string;
}

export interface MilestoneMeta {
  thresholdPercent: number;
  title: string;
}

export interface SalesDayPoint {
  day: DayKey;
  label: string;
  quantity: number;
}

export interface SalesFormValues {
  quantity: string;
  platform: Platform;
  day: string;
  note: string;
}
