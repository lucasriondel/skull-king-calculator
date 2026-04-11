import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
    <>
      <div className="space-y-3">
        {players.map((player, index) => (
          <PlayerCard
            key={player.name}
            mode="bids"
            player={player}
            playerIndex={index}
            cardsThisRound={cardsThisRound}
            bid={roundData[index]?.bid}
            onSelectBid={(num) => updateBid(index, num)}
          />
        ))}
      </div>
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
    </>
  );
}
