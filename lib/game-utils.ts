import { BonusType, SUITS } from "@/components/game/BonusControls";

export type PlayerBidTricks = { bid: number; tricks: number };

function metBid({ bid, tricks }: PlayerBidTricks): boolean {
  return bid === tricks;
}

export function calculateScore(
  bid: number,
  tricks: number,
  cardsThisRound: number,
  playerBonuses?: BonusType,
  playerIndex?: number,
  allRoundData?: PlayerBidTricks[],
  rascalBet?: { playerIndex: number; amount: 10 | 20 } | null
): number {
  let baseScore = 0;

  // Base score calculation
  if (bid === 0) {
    baseScore = tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound;
  } else {
    baseScore = bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks);
  }

  // If no bonuses or if the bid was not successful, return base score
  if (!playerBonuses || baseScore < 0) {
    return baseScore;
  }

  let bonusScore = 0;

  // Color bonuses (+10)
  if (playerBonuses.greenBonus) bonusScore += 10;
  if (playerBonuses.yellowBonus) bonusScore += 10;
  if (playerBonuses.purpleBonus) bonusScore += 10;

  // Dark bonus (+20)
  if (playerBonuses.darkBonus) bonusScore += 20;

  // Treasure bonus: +20 per treasure, but only for groups where every
  // alliance member met their bid. Falls back to the raw treasure count
  // when we don't have alliance context yet (e.g. live preview without
  // partner tricks entered).
  let treasureBonus = 0;
  if (
    playerBonuses.treasureGroups &&
    playerBonuses.treasureGroups.length > 0 &&
    allRoundData &&
    playerIndex !== undefined
  ) {
    for (const group of playerBonuses.treasureGroups) {
      const everyoneMet = group.playerIndexes.every((i) => {
        const data = allRoundData[i];
        return data !== undefined && metBid(data);
      });
      if (everyoneMet) {
        treasureBonus += group.treasureCount * 20;
      }
    }
  } else {
    treasureBonus = (playerBonuses?.treasure ?? 0) * 20;
  }

  const mermaidBonus = (playerBonuses?.mermaid ?? 0) * 20;
  const pirateBonus = (playerBonuses?.pirate ?? 0) * 30;
  const skullKingBonus = playerBonuses.skullKing ? 40 : 0;

  // Expansion capture cards. Like every other bonus these are gated on the
  // bid being met — the `baseScore < 0` early return above handles that, so
  // the 7s only subtract from players who already scored. One 8 and one 7 per
  // suit, each worth +5 / -5.
  const plusFiveBonus =
    SUITS.filter((suit) => playerBonuses[`${suit.key}PlusFive`]).length * 5;
  const minusFiveBonus =
    SUITS.filter((suit) => playerBonuses[`${suit.key}MinusFive`]).length * -5;
  const secondBonus = (playerBonuses?.second ?? 0) * 30;

  bonusScore += treasureBonus;
  bonusScore += mermaidBonus;
  bonusScore += pirateBonus;
  bonusScore += skullKingBonus;
  bonusScore += plusFiveBonus;
  bonusScore += minusFiveBonus;
  bonusScore += secondBonus;

  // Rascal's bet: if this player placed the bet, add or subtract the amount
  if (rascalBet && rascalBet.playerIndex === playerIndex) {
    if (bid === tricks) {
      bonusScore += rascalBet.amount;
    } else {
      bonusScore -= rascalBet.amount;
    }
  }

  return baseScore + bonusScore;
}
