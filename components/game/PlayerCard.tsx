import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CardButtonGrid } from "@/components/ui/card-button-grid";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  rascalBet: { playerIndex: number; amount: 10 | 20 } | null;
  setRascalBet: React.Dispatch<React.SetStateAction<{ playerIndex: number; amount: 10 | 20 } | null>>;
}

type PlayerCardProps = BidsModeProps | TricksModeProps;

function RascalBetRow({
  playerIndex,
  rascalBet,
  setRascalBet,
  t,
}: {
  playerIndex: number;
  rascalBet: { playerIndex: number; amount: 10 | 20 } | null;
  setRascalBet: React.Dispatch<React.SetStateAction<{ playerIndex: number; amount: 10 | 20 } | null>>;
  t: (key: string, params?: any) => string;
}) {
  const isSelected = rascalBet?.playerIndex === playerIndex;
  const selectedAmount = isSelected ? rascalBet.amount : null;

  const buttonClass =
    "rounded-none h-10 w-full min-w-0 px-0 border-0";

  return (
    <CardButtonGrid.Row columns={3} isLastRow>
      <CardButtonGrid.Cell colIndex={0}>
        <div className="flex items-center w-full h-10">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-none border-0 text-muted-foreground hover:text-destructive",
              !isSelected && "invisible"
            )}
            onClick={() => setRascalBet(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground truncate flex-1 text-center pr-10">
            {t("rascalBet")}
          </span>
        </div>
      </CardButtonGrid.Cell>
      <CardButtonGrid.Cell colIndex={1}>
        <Button
          variant="ghost"
          className={cn(
            buttonClass,
            selectedAmount === 10 && "bg-accent/60"
          )}
          onClick={() => setRascalBet({ playerIndex, amount: 10 })}
        >
          10
        </Button>
      </CardButtonGrid.Cell>
      <CardButtonGrid.Cell colIndex={2}>
        <Button
          variant="ghost"
          className={cn(
            buttonClass,
            selectedAmount === 20 && "bg-accent/60"
          )}
          onClick={() => setRascalBet({ playerIndex, amount: 20 })}
        >
          20
        </Button>
      </CardButtonGrid.Cell>
    </CardButtonGrid.Row>
  );
}

export function PlayerCard(props: PlayerCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "GamePage" });
  const { startingPlayerIndex, piratePowers } = useGameStore();
  const { player, playerIndex, cardsThisRound, mode } = props;

  const isStartingPlayer = playerIndex === startingPlayerIndex;
  const showScore = mode === "tricks" && props.tricks !== undefined;

  return (
    <Card className="border-0 overflow-hidden ring-1 ring-border">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 flex-wrap text-base font-medium">
          <div className="flex flex-1 justify-between items-center gap-2">

<div className="flex items-center gap-2">
          <span>{player.name}</span>
          {showScore && (
            <Badge variant={props.score >= 0 ? "success" : "destructive"}>
              {props.score >= 0 ? "+" : ""}
              {props.score}
            </Badge>
          )}
</div>

          {isStartingPlayer && (
            <Badge>{t("startingPlayer", { default: "Starts" })}</Badge>
          )}
          </div>
        </CardTitle>
        
      </CardHeader>
      {mode === "bids" ? (
        <NumberSelector
          length={cardsThisRound + 1}
          selected={props.bid}
          onSelect={props.onSelectBid}
          isLastSection
        />
      ) : (
        <>
          <NumberSelector
            length={cardsThisRound + 1}
            selected={props.tricks}
            onSelect={props.onSelectTricks}
            highlightNumber={props.bid}
          />
          <BonusControls
            playerIndex={playerIndex}
            players={props.players}
            bonuses={props.bonuses}
            setBonuses={props.setBonuses}
            getPlayerWithBonus={props.getPlayerWithBonus}
            isLastSection={!piratePowers || (props.rascalBet !== null && props.rascalBet.playerIndex !== playerIndex)}
          />
          {piratePowers && (props.rascalBet === null || props.rascalBet.playerIndex === playerIndex) && (
            <RascalBetRow
              playerIndex={playerIndex}
              rascalBet={props.rascalBet}
              setRascalBet={props.setRascalBet}
              t={t}
            />
          )}
        </>
      )}
    </Card>
  );
}
