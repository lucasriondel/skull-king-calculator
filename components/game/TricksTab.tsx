import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMobile } from "@/hooks/use-mobile";
import { BonusControls, BonusType } from "./BonusControls";

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
    playerBonuses?: BonusType
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
    <Card>
      <CardHeader>
        <CardTitle>{t("enterTricksWon")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map((player, index) => (
          <div key={player.name} className="space-y-2">
            <div className="flex justify-between items-center flex-col gap-2 md:flex-row">
              <div className="w-full flex flex-row gap-2 items-center justify-between md:flex-col md:items-start md:w-auto">
                <Label className="text-base font-medium">{player.name}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("bid")}: {roundData[index]?.bid}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("score")}:{" "}
                  {calculateScore(
                    roundData[index]?.bid || 0,
                    roundData[index]?.tricks || 0,
                    bonuses[index]
                  )}
                </p>
              </div>

              <div>
                <BonusControls
                  playerIndex={index}
                  bonuses={bonuses}
                  setBonuses={setBonuses}
                  getPlayerWithBonus={getPlayerWithBonus}
                />
              </div>
            </div>
            <div className="overflow-x-auto pb-2">
              <div
                className="flex space-x-1"
                style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}
              >
                {Array.from({ length: cardsThisRound + 1 }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => updateTricks(index, i)}
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-full cursor-pointer
                      border transition-colors
                      ${
                        roundData[index]?.tricks === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent border-input"
                      }
                    `}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
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
    </Card>
  );
}
