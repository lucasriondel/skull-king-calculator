import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMobile } from "@/hooks/use-mobile";
import { useGameStore } from "@/lib/store";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { BonusControls, BonusType } from "./BonusControls";
import { NumberSelector } from "./NumberSelector";

interface Player {
  name: string;
  score: number;
}

interface RoundData {
  playerId: string;
  bid: number;
  tricks: number;
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

  const { startingPlayerIndex } = useGameStore();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {players.map((player, index) => {
          const score = calculateScore(
            roundData[index]?.bid || 0,
            roundData[index]?.tricks || 0,
            bonuses[index],
            index
          );

          return (
            <div key={player.name} className="space-y-2">
              <div className="flex justify-between items-center flex-col gap-2 md:flex-row">
                <div className="w-full md:w-min flex flex-row gap-2 justify-between">
                  <div className="flex flex-row gap-2 items-center md:flex-col md:items-start md:w-auto">
                    <Label className="text-base font-medium">
                      {player.name}
                    </Label>
                    <Badge variant={score >= 0 ? "success" : "destructive"}>
                      {score >= 0 ? "+" : ""}
                      {score}
                    </Badge>
                    {index === startingPlayerIndex && !isMobile && (
                      <Badge>
                        {t("startingPlayer", { default: "Starts" })}
                      </Badge>
                    )}
                  </div>

                  {index === startingPlayerIndex && isMobile && (
                    <Badge>{t("startingPlayer", { default: "Starts" })}</Badge>
                  )}
                </div>

                <div>
                  <BonusControls
                    playerIndex={index}
                    players={players}
                    bonuses={bonuses}
                    setBonuses={setBonuses}
                    getPlayerWithBonus={getPlayerWithBonus}
                  />
                </div>
              </div>
              <div className="overflow-x-auto pb-2">
                <NumberSelector
                  length={cardsThisRound + 1}
                  selected={roundData[index]?.tricks}
                  onSelect={(num: number) => updateTricks(index, num)}
                  highlightNumber={roundData[index]?.bid}
                />
              </div>
            </div>
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
