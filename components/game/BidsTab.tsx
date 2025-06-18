import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMobile } from "@/hooks/use-mobile";
import { useGameStore } from "@/lib/store";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";
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
  const { startingPlayerIndex } = useGameStore();

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

              {index === startingPlayerIndex && (
                <Badge>{t("startingPlayer", { default: "Starts" })}</Badge>
              )}
            </div>
            <div className="overflow-x-auto pb-2 mx-auto">
              <NumberSelector
                length={cardsThisRound + 1}
                selected={roundData[index]?.bid}
                onSelect={(num: number) => updateBid(index, num)}
              />
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
