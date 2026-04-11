import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { BonusType } from "./BonusControls";
import { PlayerCard } from "./PlayerCard";

interface Player {
  name: string;
  score: number;
}

interface RoundData {
  playerId: string;
  bid: number;
  tricks: number | undefined;
  score: number;
}

interface TricksTabProps {
  players: Player[];
  roundData: RoundData[];
  updateTricks: (playerIndex: number, tricks: number) => void;
  cardsThisRound: number;
  canCompleteTricks: boolean;
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  getPlayerWithBonus: (
    color: "green" | "yellow" | "purple" | "dark" | "skullKing"
  ) => number | null;
  calculateScore: (
    bid: number,
    tricks: number,
    playerBonuses?: BonusType,
    playerIndex?: number
  ) => number;
  onComplete: () => void;
}

export function TricksTab({
  players,
  roundData,
  updateTricks,
  cardsThisRound,
  canCompleteTricks,
  bonuses,
  setBonuses,
  getPlayerWithBonus,
  calculateScore,
  onComplete,
}: TricksTabProps) {
  const t = useTranslations("GamePage");
  const isMobile = useMobile();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {players.map((player, index) => {
          const tricks = roundData[index]?.tricks;
          const score = calculateScore(
            roundData[index]?.bid || 0,
            tricks ?? 0,
            bonuses[index],
            index
          );

          return (
            <PlayerCard
              key={player.name}
              mode="tricks"
              player={player}
              playerIndex={index}
              cardsThisRound={cardsThisRound}
              bid={roundData[index]?.bid}
              tricks={tricks}
              onSelectTricks={(num) => updateTricks(index, num)}
              score={score}
              players={players}
              bonuses={bonuses}
              setBonuses={setBonuses}
              getPlayerWithBonus={getPlayerWithBonus}
            />
          );
        })}
      </div>
      {!isMobile && (
        <CardFooter>
          <Button
            className="w-full"
            disabled={!canCompleteTricks}
            onClick={onComplete}
            size={isMobile ? "lg" : "default"}
          >
            {isMobile ? (
              <>
                {t("buttons.complete")} <Check className="ml-2 h-5 w-5" />
              </>
            ) : (
              t("buttons.completeRound")
            )}
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
