import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  actor.setIdentity(alice);
  await expect(actor.getChallenge()).resolves.toEqual([]);
  await expect(actor.getProgress()).resolves.toEqual([]);
  await expect(actor.listSales([], [], [])).resolves.toEqual([]);
  await expect(actor.listFavorites()).resolves.toEqual([]);
  await expect(actor.listQuizHistory()).resolves.toEqual([]);
  // The tip archive is seeded by the backend, so this read is non-empty; the
  // assertion is that it answers with well-formed views rather than trapping.
  const tips = await actor.listTips([], [], []);
  expect(Array.isArray(tips)).toBe(true);
  for (const tip of tips) {
    expect(typeof tip.title).toBe("string");
    expect(typeof tip.id).toBe("bigint");
  }
});

it("answers every remaining public read without trapping", async () => {
  actor.setIdentity(alice);
  // getTodayTip and getTodayQuiz are day-keyed and may legitimately be empty on
  // a day the catalog does not cover; the assertion is that they answer rather
  // than trap. getApiDoc is a static text read.
  const todayTip = await actor.getTodayTip();
  expect(Array.isArray(todayTip)).toBe(true);
  const todayQuiz = await actor.getTodayQuiz();
  expect(Array.isArray(todayQuiz)).toBe(true);
  for (const question of todayQuiz) {
    expect(typeof question.prompt).toBe("string");
    expect(Array.isArray(question.options)).toBe(true);
  }
  await expect(actor.getQuizResult(20260101n)).resolves.toEqual([]);
  const apiDoc = await actor.getApiDoc();
  expect(typeof apiDoc).toBe("string");
});

it("round-trips a challenge and sales through the real canister", async () => {
  actor.setIdentity(alice);
  const challenge = await actor.startChallenge(1_000_000n, 20260101n);
  expect(challenge.target).toBe(1_000_000n);

  const entry = await actor.recordSales(20260101n, 1_000n, { shopee: null });
  expect(entry.quantity).toBe(1_000n);
  expect(entry.platform).toEqual({ shopee: null });

  const sales = await actor.listSales([], [], []);
  expect(sales).toHaveLength(1);
  expect(sales[0].quantity).toBe(1_000n);

  const progress = await actor.getProgress();
  expect(progress).not.toEqual([]);
  if (progress.length > 0) {
    expect(progress[0].totalSold).toBe(1_000n);
  }
});

it("records and reads back a tip done mark and a favorite", async () => {
  actor.setIdentity(alice);
  const tips = await actor.listTips([], [], []);
  if (tips.length === 0) {
    // No seeded tips in this build; the read itself is the assertion.
    expect(tips).toEqual([]);
    return;
  }
  const tipId = tips[0].id;
  await actor.markTipDone(tipId);
  await actor.addFavorite(tipId);
  const favorites = await actor.listFavorites();
  expect(favorites.some((tip) => tip.id === tipId)).toBe(true);
  await actor.unmarkTipDone(tipId);
  await actor.removeFavorite(tipId);
});

it("keeps one caller's sales and challenge separate from another's", async () => {
  actor.setIdentity(alice);
  await actor.recordSales(20260102n, 250n, { lazada: null });

  actor.setIdentity(bob);
  const bobSales = await actor.listSales([], [], []);
  expect(bobSales).toEqual([]);
  await expect(actor.getChallenge()).resolves.toEqual([]);
});

it("keeps one caller's tip marks and favorites separate from another's", async () => {
  actor.setIdentity(alice);
  const tips = await actor.listTips([], [], []);
  if (tips.length === 0) {
    // No seeded tips in this build; the read itself is the assertion.
    expect(tips).toEqual([]);
    return;
  }
  const tipId = tips[0].id;
  await actor.markTipDone(tipId);
  await actor.addFavorite(tipId);

  actor.setIdentity(bob);
  const bobFavorites = await actor.listFavorites();
  expect(bobFavorites.some((tip) => tip.id === tipId)).toBe(false);
  const bobTips = await actor.listTips([], [], []);
  const bobView = bobTips.find((tip) => tip.id === tipId);
  if (bobView !== undefined) {
    expect(bobView.done).toBe(false);
    expect(bobView.favorite).toBe(false);
  }
});

it("keeps one caller's quiz history separate from another's", async () => {
  actor.setIdentity(alice);
  const questions = await actor.getTodayQuiz();
  if (questions.length === 0) {
    // No quiz seeded for today; the read itself is the assertion.
    expect(questions).toEqual([]);
    return;
  }
  const answers: Array<[bigint, bigint]> = questions.map((question) => [
    question.id,
    0n,
  ]);
  await actor.submitQuiz(answers);
  const aliceHistory = await actor.listQuizHistory();
  expect(aliceHistory.length).toBeGreaterThan(0);

  actor.setIdentity(bob);
  await expect(actor.listQuizHistory()).resolves.toEqual([]);
});
