import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Podium } from "@/components/game/Podium";
import { useTranslations } from "next-intl";

interface Player {
  name: string;
  score: number;
}

interface ScoresTabProps {
  players: Player[];
  onBackToBids: () => void;
}

export function ScoresTab({ players }: ScoresTabProps) {
  const t = useTranslations("GamePage");
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
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
              <div
                key={player.name}
                className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-bold w-6 text-center">
                    {idx + 4}
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
