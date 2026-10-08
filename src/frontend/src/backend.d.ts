import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface Challenge {
    startDay: DayKey;
    createdAt: Timestamp;
    target: bigint;
}
export interface ChallengeProgress {
    totalSold: bigint;
    perPlatform: Array<[Platform, bigint]>;
    percent: bigint;
    target: bigint;
    dayNumber: bigint;
    daysRemaining: bigint;
    currentStreak: bigint;
    milestones: Array<Milestone>;
}
export type DayKey = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Milestone {
    title: string;
    unlocked: boolean;
    thresholdPercent: bigint;
}
export interface QuizAnswerFeedback {
    correctIndex: bigint;
    explanation: string;
    correct: boolean;
    questionId: bigint;
    chosenIndex: bigint;
}
export interface QuizQuestionView {
    id: bigint;
    prompt: string;
    options: Array<string>;
}
export interface QuizResult {
    day: DayKey;
    completedAt: Timestamp;
    total: bigint;
    score: bigint;
    points: bigint;
}
export interface QuizSubmission {
    day: DayKey;
    total: bigint;
    feedback: Array<QuizAnswerFeedback>;
    score: bigint;
    points: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SalesEntry {
    day: DayKey;
    platform: Platform;
    updatedAt: Timestamp;
    quantity: bigint;
}
export type Timestamp = bigint;
export interface TipView {
    id: bigint;
    day: DayKey;
    theme: TipTheme;
    title: string;
    done: boolean;
    actionStep: string;
    platform: Platform;
    summary: string;
    favorite: boolean;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Platform {
    shopee = "shopee",
    lazada = "lazada",
    tiktokShop = "tiktokShop"
}
export enum TipTheme {
    listing = "listing",
    layananPelanggan = "layananPelanggan",
    analisisData = "analisisData",
    promosi = "promosi",
    konten = "konten"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a tip to the caller's favorites.
     */
    addFavorite(tipId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return the caller's challenge configuration.
     */
    getChallenge(): Promise<Challenge | null>;
    /**
     * / Return the caller's aggregate challenge progress.
     */
    getProgress(): Promise<ChallengeProgress | null>;
    /**
     * / Return the caller's quiz result for a given day, if played.
     */
    getQuizResult(day: DayKey): Promise<QuizResult | null>;
    /**
     * / Return today's quiz questions (correct answers withheld).
     */
    getTodayQuiz(): Promise<Array<QuizQuestionView>>;
    /**
     * / Return the tip scheduled for today.
     */
    getTodayTip(): Promise<TipView | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Return the caller's favorite tips.
     */
    listFavorites(): Promise<Array<TipView>>;
    /**
     * / Return the caller's quiz history, newest first.
     */
    listQuizHistory(): Promise<Array<QuizResult>>;
    /**
     * / Return the caller's sales history, newest first, optionally filtered by
     * / platform and an inclusive day range.
     */
    listSales(platform: Platform | null, fromDay: DayKey | null, toDay: DayKey | null): Promise<Array<SalesEntry>>;
    /**
     * / Browse the tip archive, optionally filtered by day, platform, and theme.
     */
    listTips(day: DayKey | null, platform: Platform | null, theme: TipTheme | null): Promise<Array<TipView>>;
    /**
     * / Mark a tip as done for the caller.
     */
    markTipDone(tipId: bigint): Promise<void>;
    /**
     * / Record or update the caller's sales for a day.
     */
    recordSales(day: DayKey, quantity: bigint, platform: Platform): Promise<SalesEntry>;
    /**
     * / Remove a tip from the caller's favorites.
     */
    removeFavorite(tipId: bigint): Promise<void>;
    schema(): Promise<string>;
    /**
     * / Start the caller's 100-day challenge.
     */
    startChallenge(target: bigint, startDay: DayKey): Promise<Challenge>;
    /**
     * / Submit the caller's answers for today's quiz.
     */
    submitQuiz(answers: Array<[bigint, bigint]>): Promise<QuizSubmission>;
    /**
     * / Remove the caller's done mark from a tip.
     */
    unmarkTipDone(tipId: bigint): Promise<void>;
}
