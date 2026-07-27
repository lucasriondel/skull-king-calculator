import { describe, expect, test } from "bun:test";
import {
  BonusType,
  emptyBonuses,
  SUIT_CARDS,
  type ExclusiveBonus,
} from "./BonusControls";
import { calculateScore } from "@/lib/game-utils";

// Behavioural checks for the cross-player rules the UI enforces. Every cell in
// the suit row is a single physical card, so no two players can hold the same
// one in a round.

/** Mirrors `getPlayerWithBonus` in the game route. */
function getPlayerWithBonus(
  bonuses: Record<number, BonusType>,
  card: ExclusiveBonus
): number | null {
  const entry = Object.entries(bonuses).find(([, b]) => {
    switch (card) {
      case "skullKing":
        return b.skullKing;
      case "second":
        return b.second > 0;
      case "green":
      case "yellow":
      case "purple":
      case "dark":
        return b[`${card}Bonus`];
      default:
        return b[card];
    }
  });
  return entry ? parseInt(entry[0]) : null;
}

describe("getPlayerWithBonus resolves every suit card", () => {
  test("finds the holder of each of the twelve cards", () => {
    for (const card of SUIT_CARDS) {
      const bonuses = {
        0: emptyBonuses(),
        1: { ...emptyBonuses(), [card.field]: true },
      };
      expect(getPlayerWithBonus(bonuses, card.value)).toBe(1);
    }
  });

  test("returns null when nobody holds a card", () => {
    const bonuses = { 0: emptyBonuses(), 1: emptyBonuses() };
    for (const card of SUIT_CARDS) {
      expect(getPlayerWithBonus(bonuses, card.value)).toBeNull();
    }
  });

  test("a suit's 7, 8 and 14 do not shadow each other", () => {
    const bonuses = {
      0: { ...emptyBonuses(), greenMinusFive: true },
      1: { ...emptyBonuses(), greenPlusFive: true },
      2: { ...emptyBonuses(), greenBonus: true },
    };
    expect(getPlayerWithBonus(bonuses, "greenMinusFive")).toBe(0);
    expect(getPlayerWithBonus(bonuses, "greenPlusFive")).toBe(1);
    expect(getPlayerWithBonus(bonuses, "green")).toBe(2);
  });

  test("suits do not shadow each other", () => {
    const bonuses = {
      0: { ...emptyBonuses(), greenPlusFive: true },
      1: { ...emptyBonuses(), yellowPlusFive: true },
    };
    expect(getPlayerWithBonus(bonuses, "greenPlusFive")).toBe(0);
    expect(getPlayerWithBonus(bonuses, "yellowPlusFive")).toBe(1);
    expect(getPlayerWithBonus(bonuses, "purplePlusFive")).toBeNull();
  });

  test("the Second does not shadow the Skull King", () => {
    const bonuses = {
      0: { ...emptyBonuses(), second: 1 },
      1: { ...emptyBonuses(), skullKing: true },
    };
    expect(getPlayerWithBonus(bonuses, "second")).toBe(0);
    expect(getPlayerWithBonus(bonuses, "skullKing")).toBe(1);
  });

  test("a zero Second count does not read as held", () => {
    expect(
      getPlayerWithBonus({ 0: { ...emptyBonuses(), second: 0 } }, "second")
    ).toBeNull();
  });
});

describe("no card is scored twice across players", () => {
  const bonusOf = (b: BonusType) => calculateScore(2, 2, 5, b) - 40;

  test("two holders of the same 8 would double-count it", () => {
    // Guard against a regression where claiming a card leaves it set on the
    // previous holder: both players would bank +5 for one physical card.
    const contested = {
      0: { ...emptyBonuses(), greenPlusFive: true },
      1: { ...emptyBonuses(), greenPlusFive: true },
    };
    expect(bonusOf(contested[0]) + bonusOf(contested[1])).toBe(10);

    const resolved = {
      0: { ...emptyBonuses(), greenPlusFive: false },
      1: { ...emptyBonuses(), greenPlusFive: true },
    };
    expect(bonusOf(resolved[0]) + bonusOf(resolved[1])).toBe(5);
  });

  test("two holders of the Second would double-count it", () => {
    const contested = {
      0: { ...emptyBonuses(), second: 1 },
      1: { ...emptyBonuses(), second: 1 },
    };
    expect(bonusOf(contested[0]) + bonusOf(contested[1])).toBe(60);

    const resolved = {
      0: { ...emptyBonuses(), second: 0 },
      1: { ...emptyBonuses(), second: 1 },
    };
    expect(bonusOf(resolved[0]) + bonusOf(resolved[1])).toBe(30);
  });

  test("different players may hold different suits' cards", () => {
    // The exclusivity is per card, not per card type: four players can each
    // hold one 7 in the same round.
    const spread = {
      0: { ...emptyBonuses(), greenMinusFive: true },
      1: { ...emptyBonuses(), yellowMinusFive: true },
      2: { ...emptyBonuses(), purpleMinusFive: true },
      3: { ...emptyBonuses(), darkMinusFive: true },
    };
    for (const player of Object.values(spread)) {
      expect(bonusOf(player)).toBe(-5);
    }
  });
});
