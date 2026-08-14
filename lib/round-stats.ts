import { SUITS } from "@/components/game/BonusControls";
import type { Player, RoundData } from "@/lib/store";

/**
 * Per-round derivations shared by the details table and the charts.
 *
 * `DetailsTab` grew its own copies of this arithmetic while it was the only
 * consumer. The charts need the exact same split — base vs bonus vs running
 * total — and two implementations of the scoring rules would drift, so the
 * shared parts live here and both render from one source.
 *
 * Note this is deliberately *not* `lib/game-utils.ts#calculateScore`: that one
 * returns a single fused number for the store to persist, whereas the views
 * need the components separately (a bonus badge, a bonus-per-round bar).
 */

export function calculateBaseScore(
  bid: number,
  tricks: number,
  cardsThisRound: number
): number {
  if (bid === 0) {
    return tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound;
  }
  return bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks);
}

/** Count the captured 8s (`PlusFive`) or 7s (`MinusFive`) across all suits. */
export function countSuitCards(
  bonuses: NonNullable<RoundData["bonuses"]>,
  kind: "PlusFive" | "MinusFive"
): number {
  return SUITS.filter((suit) => bonuses[`${suit.key}${kind}`]).length;
}

/**
 * Treasure only pays out when every member of the alliance met their bid, so
 * it can't be scored from one player's row alone — hence `allRoundData`.
 */
export function getEffectiveTreasureCount(
  bonuses: RoundData["bonuses"],
  allRoundData: (RoundData | undefined)[]
): number {
  if (!bonuses?.treasureGroups?.length) {
    return bonuses?.treasure ?? 0;
  }
  let count = 0;
  for (const group of bonuses.treasureGroups) {
    const everyoneMet = group.playerIndexes.every((i) => {
      const data = allRoundData[i];
      return data !== undefined && data.bid === data.tricks;
    });
    if (everyoneMet) count += group.treasureCount;
  }
  return count;
}

export function calculateBonusScore(
  bonuses: RoundData["bonuses"],
  effectiveTreasureCount: number,
  rascalBet?: RoundData["rascalBet"],
  playerIndex?: number,
  bidMet?: boolean
): number {
  if (!bonuses) {
    return 0;
  }

  let bonusScore = 0;
  if (bonuses.greenBonus) bonusScore += 10;
  if (bonuses.yellowBonus) bonusScore += 10;
  if (bonuses.purpleBonus) bonusScore += 10;
  if (bonuses.darkBonus) bonusScore += 20;
  bonusScore += effectiveTreasureCount * 20;
  if (bonuses.mermaid) bonusScore += bonuses.mermaid * 20;
  if (bonuses.pirate) bonusScore += bonuses.pirate * 30;
  if (bonuses.skullKing) bonusScore += 40;
  bonusScore += countSuitCards(bonuses, "PlusFive") * 5;
  bonusScore -= countSuitCards(bonuses, "MinusFive") * 5;
  if (bonuses.second) bonusScore += bonuses.second * 30;

  if (rascalBet && rascalBet.playerIndex === playerIndex) {
    bonusScore += bidMet ? rascalBet.amount : -rascalBet.amount;
  }

  return bonusScore;
}

/** One player's fully-derived result for one round. */
export type RoundBreakdown = {
  baseScore: number;
  /** The bonus the player *would* score; shown even when it doesn't apply. */
  potentialBonusScore: number;
  /** The bonus actually credited — zero unless the bid was met. */
  bonusScore: number;
  roundScore: number;
  bidMet: boolean;
};

export function breakdownForRound(
  roundData: RoundData,
  playerIndex: number,
  allRoundData: (RoundData | undefined)[]
): RoundBreakdown {
  const baseScore = calculateBaseScore(
    roundData.bid,
    roundData.tricks ?? 0,
    roundData.cardsThisRound || 0
  );
  const effectiveTreasureCount = getEffectiveTreasureCount(
    roundData.bonuses,
    allRoundData
  );
  const bidMet = roundData.bid === (roundData.tricks ?? 0);
  const potentialBonusScore = calculateBonusScore(
    roundData.bonuses,
    effectiveTreasureCount,
    roundData.rascalBet,
    playerIndex,
    bidMet
  );
  // Bonuses ride on a met bid: a blown bid scores its penalty and nothing else.
  const bonusScore = baseScore > 0 ? potentialBonusScore : 0;

  return {
    baseScore,
    potentialBonusScore,
    bonusScore,
    roundScore: baseScore + bonusScore,
    bidMet,
  };
}

/** How many rounds any player has actually recorded. */
export function playedRoundCount(players: Player[]): number {
  return players.reduce((max, player) => Math.max(max, player.rounds.length), 0);
}

export type PlayerRoundStats = {
  /** Running total after each played round, index 0 = round 1. */
  cumulativeScores: number[];
  /** Bonus points credited per played round. */
  bonusPerRound: number[];
  zeroBids: number;
  bidsWon: number;
  bidsLost: number;
};

/**
 * Walk every player through every played round once.
 *
 * The charts each need a different slice of this, but they all need the same
 * alliance-aware pass over the rounds, so it runs once and they read from it.
 */
export function computePlayerStats(players: Player[]): PlayerRoundStats[] {
  const roundCount = playedRoundCount(players);

  const stats: PlayerRoundStats[] = players.map(() => ({
    cumulativeScores: [],
    bonusPerRound: [],
    zeroBids: 0,
    bidsWon: 0,
    bidsLost: 0,
  }));

  const runningTotals = players.map(() => 0);

  for (let round = 0; round < roundCount; round++) {
    const allRoundData = players.map((player) => player.rounds[round]);

    players.forEach((player, playerIndex) => {
      const roundData = player.rounds[round];
      const playerStats = stats[playerIndex];

      if (!roundData) {
        // Keep the series aligned to the round axis: a player with no entry
        // holds their previous total rather than shifting later rounds left.
        playerStats.cumulativeScores.push(runningTotals[playerIndex]);
        playerStats.bonusPerRound.push(0);
        return;
      }

      const { bonusScore, roundScore, bidMet } = breakdownForRound(
        roundData,
        playerIndex,
        allRoundData
      );

      runningTotals[playerIndex] += roundScore;
      playerStats.cumulativeScores.push(runningTotals[playerIndex]);
      playerStats.bonusPerRound.push(bonusScore);

      if (roundData.bid === 0) playerStats.zeroBids++;
      if (bidMet) playerStats.bidsWon++;
      else playerStats.bidsLost++;
    });
  }

  return stats;
}
