import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useMobile } from "@/hooks/use-mobile";

interface Player {
  name: string;
  score: number;
}

interface ScoresTabProps {
  players: Player[];
  onBackToBids: () => void;
}

export function ScoresTab({ players, onBackToBids }: ScoresTabProps) {
  const t = useTranslations("GamePage");
  const isMobile = useMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("currentScores")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <div
                key={player.name}
                className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
              >
                <span className="font-medium">{player.name}</span>
                <span className="font-bold">{player.score}</span>
              </div>
            ))}
        </div>
      </CardContent>
      {!isMobile && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={onBackToBids}
            size={isMobile ? "lg" : "default"}
          >
            {t("buttons.backToBids")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
