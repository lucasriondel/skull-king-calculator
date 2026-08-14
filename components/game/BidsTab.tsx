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
}

export function BidsTab({
  players,
  roundData,
  updateBid,
  cardsThisRound,
}: BidsTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
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
