import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Podium } from "@/components/game/Podium";
import { ScoreRow } from "@/components/game/ScoreRow";
import { withPlayerColorIndex } from "@/lib/player-colors";
import { useTranslation } from "react-i18next";

interface Player {
  name: string;
  score: number;
}

interface ScoresTabProps {
  players: Player[];
}

export function ScoresTab({ players }: ScoresTabProps) {
  const { t } = useTranslation("translation", { keyPrefix: "GamePage" });
  // Tag before sorting: a player's color follows their seat, not their rank.
  const sortedPlayers = [...withPlayerColorIndex(players)].sort(
    (a, b) => b.score - a.score
  );
  const remainingPlayers = sortedPlayers.slice(Math.min(3, sortedPlayers.length));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("currentScores")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Podium players={sortedPlayers} />
        {remainingPlayers.length > 0 && (
          <div className="space-y-2">
            {remainingPlayers.map((player, idx) => (
              <ScoreRow
                key={player.name}
                name={player.name}
                place={idx + 4}
                colorIndex={player.colorIndex}
              >
                {player.score}
              </ScoreRow>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
