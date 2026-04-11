import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { useTranslations } from "next-intl";
import { BonusControls, BonusType } from "./BonusControls";
import { NumberSelector } from "./NumberSelector";

interface Player {
  name: string;
  score: number;
}

type PlayerCardMode = "bids" | "tricks";

interface PlayerCardBaseProps {
  player: Player;
  playerIndex: number;
  cardsThisRound: number;
}

interface BidsModeProps extends PlayerCardBaseProps {
  mode: "bids";
  bid: number | undefined;
  onSelectBid: (bid: number) => void;
}

interface TricksModeProps extends PlayerCardBaseProps {
  mode: "tricks";
  bid: number | undefined;
  tricks: number | undefined;
  onSelectTricks: (tricks: number) => void;
  score: number;
  players: Player[];
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  getPlayerWithBonus: (
    color: "green" | "yellow" | "purple" | "dark" | "skullKing"
  ) => number | null;
}

type PlayerCardProps = BidsModeProps | TricksModeProps;

export function PlayerCard(props: PlayerCardProps) {
  const t = useTranslations("GamePage");
  const { startingPlayerIndex } = useGameStore();
  const { player, playerIndex, cardsThisRound, mode } = props;

  const isStartingPlayer = playerIndex === startingPlayerIndex;
  const showScore = mode === "tricks" && props.tricks !== undefined;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{player.name}</span>
            {isStartingPlayer && (
              <Badge>{t("startingPlayer", { default: "Starts" })}</Badge>
            )}
            {showScore && (
              <Badge
                variant={props.score >= 0 ? "success" : "destructive"}
              >
                {props.score >= 0 ? "+" : ""}
                {props.score}
              </Badge>
            )}
          </div>
          {mode === "tricks" && (
            <BonusControls
              playerIndex={playerIndex}
              players={props.players}
              bonuses={props.bonuses}
              setBonuses={props.setBonuses}
              getPlayerWithBonus={props.getPlayerWithBonus}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="overflow-x-auto pb-2 mx-auto">
          {mode === "bids" ? (
            <NumberSelector
              length={cardsThisRound + 1}
              selected={props.bid}
              onSelect={props.onSelectBid}
            />
          ) : (
            <NumberSelector
              length={cardsThisRound + 1}
              selected={props.tricks}
              onSelect={props.onSelectTricks}
              highlightNumber={props.bid}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
