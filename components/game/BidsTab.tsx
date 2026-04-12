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
}: BidsTabProps) {
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
    </>
  );
}
