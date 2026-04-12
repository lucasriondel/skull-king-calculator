import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface Player {
  name: string;
  score: number;
}

interface ScoresTabProps {
  players: Player[];
  onBackToBids: () => void;
}

const podiumColors = [
  { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-400" },
  { bg: "bg-gray-300", text: "text-black", border: "border-gray-300" },
  { bg: "bg-amber-700", text: "text-white", border: "border-amber-600" },
];

const podiumHeights = ["h-28", "h-20", "h-14"];

function Podium({ players }: { players: Player[] }) {
  const top3 = players.slice(0, 3);
  // Display order: 2nd, 1st, 3rd
  const displayOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rankOrder = [1, 0, 2]; // maps display position to rank index

  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {displayOrder.map((player, displayIdx) => {
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

export function ScoresTab({ players }: ScoresTabProps) {
  const t = useTranslations("GamePage");
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const showPodium = sortedPlayers.length >= 3;
  const remainingPlayers = showPodium ? sortedPlayers.slice(3) : sortedPlayers;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("currentScores")}</CardTitle>
      </CardHeader>
      <CardContent>
        {showPodium && <Podium players={sortedPlayers} />}
        {remainingPlayers.length > 0 && (
          <div className="space-y-2">
            {remainingPlayers.map((player, idx) => (
              <div
                key={player.name}
                className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-bold w-6 text-center">
                    {showPodium ? idx + 4 : idx + 1}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
