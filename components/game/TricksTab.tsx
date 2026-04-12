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
  rascalBet: { playerIndex: number; amount: 10 | 20 } | null;
  setRascalBet: React.Dispatch<React.SetStateAction<{ playerIndex: number; amount: 10 | 20 } | null>>;
}

export function TricksTab({
  players,
  roundData,
  updateTricks,
  cardsThisRound,
  bonuses,
  setBonuses,
  getPlayerWithBonus,
  calculateScore,
  rascalBet,
  setRascalBet,
}: TricksTabProps) {
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
              rascalBet={rascalBet}
              setRascalBet={setRascalBet}
            />
          );
        })}
      </div>
    </div>
  );
}
