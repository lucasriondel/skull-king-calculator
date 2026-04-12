import { Trophy } from "lucide-react";

interface Player {
  name: string;
  score: number;
}

const podiumColors = [
  { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-400" },
  { bg: "bg-gray-300", text: "text-black", border: "border-gray-300" },
  { bg: "bg-amber-700", text: "text-white", border: "border-amber-600" },
];

const podiumHeights = ["h-28", "h-20", "h-14"];

export function Podium({ players }: { players: Player[] }) {
  const top3 = players.slice(0, 3);

  // Display order depends on player count
  const displayOrder =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
      ? [top3[1], top3[0]]
      : [top3[0]];

  const rankOrder =
    top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];

  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {displayOrder.map((player, displayIdx) => {
        if (!player) return null;
        const rankIdx = rankOrder[displayIdx];
        const colors = podiumColors[rankIdx];
        const height = podiumHeights[rankIdx];

        return (
          <div
            key={player.name}
            className="flex flex-col items-center flex-1 max-w-[130px]"
          >
            <div className="flex flex-col items-center mb-2">
              {rankIdx === 0 && (
                <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
              )}
              <span className="text-sm font-semibold truncate max-w-[100px] text-center">
                {player.name}
              </span>
              <span className="text-xs text-muted-foreground font-bold">
                {player.score}
              </span>
            </div>
            <div
              className={`w-full ${height} ${colors.bg} rounded-t-lg flex items-center justify-center border-2 ${colors.border} border-b-0`}
            >
              <span className={`text-2xl font-black ${colors.text}`}>
                {rankIdx + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
