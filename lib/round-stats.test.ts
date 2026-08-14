import { describe, expect, test } from "bun:test";
import { emptyBonuses } from "@/components/game/BonusControls";
import {
  breakdownForRound,
  computePlayerStats,
  playedRoundCount,
} from "@/lib/round-stats";
import type { Player, RoundData } from "@/lib/store";

function round(partial: Partial<RoundData>): RoundData {
  return {
    playerId: "p",
    bid: 0,
    tricks: 0,
    score: 0,
    cardsThisRound: 1,
    ...partial,
  };
}

function player(name: string, rounds: RoundData[]): Player {
  return { name, score: 0, rounds };
}

describe("breakdownForRound", () => {
  test("a met zero bid scores 10 per card", () => {
    const result = breakdownForRound(
      round({ bid: 0, tricks: 0, cardsThisRound: 5 }),
      0,
      []
    );
    expect(result.baseScore).toBe(50);
    expect(result.bidMet).toBe(true);
  });

  test("a blown zero bid loses 10 per card", () => {
    const result = breakdownForRound(
      round({ bid: 0, tricks: 2, cardsThisRound: 5 }),
      0,
      []
    );
    expect(result.baseScore).toBe(-50);
    expect(result.bidMet).toBe(false);
  });

  test("a met bid scores 20 per trick", () => {
    const result = breakdownForRound(round({ bid: 3, tricks: 3 }), 0, []);
    expect(result.baseScore).toBe(60);
  });

  test("a missed bid loses 10 per trick of error", () => {
    const result = breakdownForRound(round({ bid: 3, tricks: 1 }), 0, []);
    expect(result.baseScore).toBe(-20);
  });

  test("bonuses are forfeited when the bid is blown", () => {
    const data = round({
      bid: 2,
      tricks: 1,
      bonuses: { ...emptyBonuses(), skullKing: true },
    });
    const result = breakdownForRound(data, 0, []);
    // The badge still shows what was on the table...
    expect(result.potentialBonusScore).toBe(40);
    // ...but nothing is credited, so the round is the penalty alone.
    expect(result.bonusScore).toBe(0);
    expect(result.roundScore).toBe(-10);
  });

  test("bonuses are credited on a met bid", () => {
    const data = round({
      bid: 1,
      tricks: 1,
      bonuses: { ...emptyBonuses(), skullKing: true },
    });
    const result = breakdownForRound(data, 0, []);
    expect(result.bonusScore).toBe(40);
    expect(result.roundScore).toBe(60);
  });

  test("treasure only pays when every alliance member met their bid", () => {
    const bonuses = {
      ...emptyBonuses(),
      treasureGroups: [
        { id: "g1", playerIndexes: [0, 1], treasureCount: 1 },
      ],
    };
    const met = round({ bid: 1, tricks: 1, bonuses });
    const partnerMissed = round({ bid: 2, tricks: 0 });

    const withPartnerMissing = breakdownForRound(met, 0, [met, partnerMissed]);
    expect(withPartnerMissing.bonusScore).toBe(0);

    const partnerMet = round({ bid: 1, tricks: 1 });
    const withPartnerMet = breakdownForRound(met, 0, [met, partnerMet]);
    expect(withPartnerMet.bonusScore).toBe(20);
  });
});

describe("computePlayerStats", () => {
  test("cumulative scores accumulate across rounds", () => {
    const players = [
      player("A", [
        round({ bid: 1, tricks: 1, score: 20 }),
        round({ bid: 2, tricks: 2, score: 40 }),
      ]),
    ];
    const [stats] = computePlayerStats(players);
    // 20, then 20 + 40.
    expect(stats.cumulativeScores).toEqual([20, 60]);
  });

  test("a missing round holds the previous total so rounds stay aligned", () => {
    const players = [
      player("A", [
        round({ bid: 1, tricks: 1 }),
        round({ bid: 1, tricks: 1 }),
      ]),
      player("B", [round({ bid: 1, tricks: 1 })]),
    ];
    const [, b] = computePlayerStats(players);
    expect(b.cumulativeScores).toHaveLength(2);
    expect(b.cumulativeScores[1]).toBe(b.cumulativeScores[0]);
    expect(b.bonusPerRound[1]).toBe(0);
  });

  test("counts zero bids, and bids won vs lost", () => {
    const players = [
      player("A", [
        round({ bid: 0, tricks: 0, cardsThisRound: 1 }),
        round({ bid: 0, tricks: 1, cardsThisRound: 2 }),
        round({ bid: 2, tricks: 2 }),
      ]),
    ];
    const [stats] = computePlayerStats(players);
    expect(stats.zeroBids).toBe(2);
    expect(stats.bidsWon).toBe(2);
    expect(stats.bidsLost).toBe(1);
  });

  test("bonus per round tracks credited bonuses only", () => {
    const bonuses = { ...emptyBonuses(), skullKing: true };
    const players = [
      player("A", [
        round({ bid: 1, tricks: 1, bonuses }),
        round({ bid: 1, tricks: 0, bonuses }),
      ]),
    ];
    const [stats] = computePlayerStats(players);
    expect(stats.bonusPerRound).toEqual([40, 0]);
  });
});

describe("playedRoundCount", () => {
  test("is the longest round history among players", () => {
    expect(
      playedRoundCount([
        player("A", [round({}), round({})]),
        player("B", [round({})]),
      ])
    ).toBe(2);
  });

  test("is zero before anything is played", () => {
    expect(playedRoundCount([player("A", [])])).toBe(0);
  });
});
