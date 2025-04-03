import { BonusType } from "@/components/game/BonusControls";

export function calculateScore(
  bid: number,
  tricks: number,
  cardsThisRound: number,
  playerBonuses?: BonusType
): number {
  console.log("calculateScore called with:", {
    bid,
    tricks,
    playerBonuses,
    cardsThisRound,
    bidType: typeof bid,
    tricksType: typeof tricks,
    cardsThisRoundType: typeof cardsThisRound,
  });

  let baseScore = 0;

  // Base score calculation
  if (bid === 0) {
    baseScore = tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound;
    console.log("Zero bid calculation:", {
      baseScore,
      cardsThisRound,
      tricks,
    });
  } else {
    baseScore = bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks);
    console.log("Non-zero bid calculation:", {
      baseScore,
      bid,
      tricks,
      diff: Math.abs(bid - tricks),
    });
  }

  // If no bonuses, return base score
  if (!playerBonuses) {
    console.log("No bonuses, returning base score:", baseScore);
    return baseScore;
  }

  let bonusScore = 0;

  // Color bonuses (+10)
  if (playerBonuses.greenBonus) bonusScore += 10;
  if (playerBonuses.yellowBonus) bonusScore += 10;
  if (playerBonuses.purpleBonus) bonusScore += 10;

  // Dark bonus (+20)
  if (playerBonuses.darkBonus) bonusScore += 20;

  // Special cards bonuses
  const treasureBonus = (playerBonuses?.treasure ?? 0) * 20;
  const mermaidBonus = (playerBonuses?.mermaid ?? 0) * 20;
  const pirateBonus = (playerBonuses?.pirate ?? 0) * 30;
  const skullKingBonus = playerBonuses.skullKing ? 40 : 0;

  bonusScore += treasureBonus;
  bonusScore += mermaidBonus;
  bonusScore += pirateBonus;
  bonusScore += skullKingBonus;

  console.log("Bonus calculation details:", {
    bonusScore,
    greenBonus: playerBonuses.greenBonus,
    yellowBonus: playerBonuses.yellowBonus,
    purpleBonus: playerBonuses.purpleBonus,
    darkBonus: playerBonuses.darkBonus,
    treasure: playerBonuses.treasure,
    treasureBonus,
    mermaid: playerBonuses.mermaid,
    mermaidBonus,
    pirate: playerBonuses.pirate,
    pirateBonus,
    skullKing: playerBonuses.skullKing,
    skullKingBonus,
  });

  const finalScore = baseScore + bonusScore;
  console.log("Final score calculation:", {
    baseScore,
    bonusScore,
    finalScore,
  });

  return finalScore;
}
