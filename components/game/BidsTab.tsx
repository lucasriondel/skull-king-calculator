import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMobile } from "@/hooks/use-mobile";

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

interface BidsTabProps {
  players: Player[];
  roundData: RoundData[];
  updateBid: (playerIndex: number, bid: number) => void;
  cardsThisRound: number;
  canCompleteBids: boolean;
  onContinue: () => void;
}

export function BidsTab({
  players,
  roundData,
  updateBid,
  cardsThisRound,
  canCompleteBids,
  onContinue,
}: BidsTabProps) {
  const t = useTranslations("GamePage");
  const isMobile = useMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("enterBids")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map((player, index) => (
          <div key={player.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">{player.name}</Label>
            </div>
            <div className="overflow-x-auto pb-2">
              <div
                className="flex space-x-1"
                style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}
              >
                {Array.from({ length: cardsThisRound + 1 }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => updateBid(index, i)}
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-full cursor-pointer
                      border transition-colors
                      ${
                        roundData[index]?.bid === i
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
            disabled={!canCompleteBids}
            onClick={onContinue}
            size={isMobile ? "lg" : "default"}
          >
            {isMobile ? (
              <>
                {t("buttons.continue")} <ArrowRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              t("buttons.continueToTricks")
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
