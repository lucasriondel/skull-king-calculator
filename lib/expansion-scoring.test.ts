import { describe, expect, test } from "bun:test";
import { emptyBonuses, SUITS } from "@/components/game/BonusControls";
import { calculateScore } from "@/lib/game-utils";

// Expansion cards: the 8 of each suit (+5), the 7 of each suit (-5) and the
// Second (+30). One physical card per suit, so the 7s/8s are per-suit flags.
// All are capture bonuses, so — like every other bonus — they only score when
// the player meets their bid.

type Bonuses = ReturnType<typeof emptyBonuses>;

const bonuses = (overrides: Partial<Bonuses> = {}): Bonuses => ({
  ...emptyBonuses(),
  ...overrides,
});

/** Turn on the 8 of the first `n` suits. */
const withEights = (n: number): Partial<Bonuses> =>
  Object.fromEntries(
    SUITS.slice(0, n).map((suit) => [`${suit.key}PlusFive`, true])
  );

/** Turn on the 7 of the first `n` suits. */
const withSevens = (n: number): Partial<Bonuses> =>
  Object.fromEntries(
    SUITS.slice(0, n).map((suit) => [`${suit.key}MinusFive`, true])
  );

// A met bid of 2 on a 5-card round: 20 * 2 = 40 base.
const MET_BID = { bid: 2, tricks: 2, cards: 5, base: 40 };
// A missed bid of 2 taking 1: -10 * |2 - 1| = -10 base.
const MISSED_BID = { bid: 2, tricks: 1, cards: 5, base: -10 };

const scoreMet = (b: Bonuses) =>
  calculateScore(MET_BID.bid, MET_BID.tricks, MET_BID.cards, b);
const scoreMissed = (b: Bonuses) =>
  calculateScore(MISSED_BID.bid, MISSED_BID.tricks, MISSED_BID.cards, b);

describe("expansion 8s (+5)", () => {
  test("adds 5 per captured 8 on a met bid", () => {
    expect(scoreMet(bonuses(withEights(1)))).toBe(MET_BID.base + 5);
    expect(scoreMet(bonuses(withEights(3)))).toBe(MET_BID.base + 15);
  });

  test("all four 8s stack", () => {
    expect(scoreMet(bonuses(withEights(4)))).toBe(MET_BID.base + 20);
  });

  test("does not apply on a missed bid", () => {
    expect(scoreMissed(bonuses(withEights(4)))).toBe(MISSED_BID.base);
  });

  test("each suit's 8 is scored independently", () => {
    for (const suit of SUITS) {
      expect(scoreMet(bonuses({ [`${suit.key}PlusFive`]: true }))).toBe(
        MET_BID.base + 5
      );
    }
  });
});

describe("expansion 7s (-5)", () => {
  test("subtracts 5 per captured 7 on a met bid", () => {
    expect(scoreMet(bonuses(withSevens(1)))).toBe(MET_BID.base - 5);
    expect(scoreMet(bonuses(withSevens(3)))).toBe(MET_BID.base - 15);
  });

  test("all four 7s stack", () => {
    expect(scoreMet(bonuses(withSevens(4)))).toBe(MET_BID.base - 20);
  });

  // The penalty is a bonus-block modifier, so a missed bid — already scoring
  // negative — is not penalised twice.
  test("does not apply on a missed bid", () => {
    expect(scoreMissed(bonuses(withSevens(4)))).toBe(MISSED_BID.base);
  });

  test("each suit's 7 is scored independently", () => {
    for (const suit of SUITS) {
      expect(scoreMet(bonuses({ [`${suit.key}MinusFive`]: true }))).toBe(
        MET_BID.base - 5
      );
    }
  });
});

describe("expansion Second (+30)", () => {
  test("adds 30 when captured on a met bid", () => {
    expect(scoreMet(bonuses({ second: 1 }))).toBe(MET_BID.base + 30);
  });

  test("does not apply on a missed bid", () => {
    expect(scoreMissed(bonuses({ second: 1 }))).toBe(MISSED_BID.base);
  });

  test("scores separately from pirates", () => {
    expect(scoreMet(bonuses({ second: 1, pirate: 1 }))).toBe(
      MET_BID.base + 30 + 30
    );
  });
});

describe("expansion cards combined", () => {
  test("8s, 7s and the Second net out against each other", () => {
    // 2 eights (+10), 3 sevens (-15), the Second (+30) => +25
    const score = scoreMet(
      bonuses({ ...withEights(2), ...withSevens(3), second: 1 })
    );
    expect(score).toBe(MET_BID.base + 25);
  });

  test("the 7 and 8 of the same suit cancel out", () => {
    expect(
      scoreMet(bonuses({ greenPlusFive: true, greenMinusFive: true }))
    ).toBe(MET_BID.base);
  });

  test("7s can drag a met bid's bonus total negative", () => {
    // A zero-bid met on a 1-card round scores 10; four 7s take off 20.
    expect(calculateScore(0, 0, 1, bonuses(withSevens(4)))).toBe(10 - 20);
  });

  test("stacks with the existing bonuses", () => {
    const score = scoreMet(
      bonuses({
        greenBonus: true,
        skullKing: true,
        ...withEights(1),
        ...withSevens(2),
      })
    );
    expect(score).toBe(MET_BID.base + 10 + 40 + 5 - 10);
  });

  test("a suit's 14 bonus is independent of its 7 and 8", () => {
    // Holding the green 14 does not imply holding the green 7 or 8.
    expect(scoreMet(bonuses({ greenBonus: true }))).toBe(MET_BID.base + 10);
    expect(scoreMet(bonuses({ greenPlusFive: true }))).toBe(MET_BID.base + 5);
  });

  test("a round with no expansion cards is unaffected", () => {
    expect(scoreMet(bonuses())).toBe(MET_BID.base);
    expect(scoreMet(bonuses({ greenBonus: true }))).toBe(MET_BID.base + 10);
  });
});

describe("zero-bid rounds", () => {
  test("expansion cards apply to a met zero bid", () => {
    // 0 bid met on a 5-card round: 10 * 5 = 50 base.
    expect(calculateScore(0, 0, 5, bonuses(withEights(2)))).toBe(50 + 10);
  });

  test("expansion cards do not apply to a missed zero bid", () => {
    expect(calculateScore(0, 1, 5, bonuses(withEights(2)))).toBe(-50);
  });
});
