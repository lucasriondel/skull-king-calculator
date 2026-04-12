import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMobile } from "@/hooks/use-mobile";
import LanguageSwitcher from "@/components/language-switcher";
import { DetailsTab } from "@/components/game/DetailsTab";
import { Podium } from "@/components/game/Podium";

interface Player {
  name: string;
  score: number;
}

interface GameCompleteProps {
  players: Player[];
  onNewGame: () => void;
}

export function GameComplete({ players, onNewGame }: GameCompleteProps) {
  const t = useTranslations("GamePage");
  const isMobile = useMobile();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
          <CardTitle className="text-3xl">{t("gameComplete.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">
            {t("gameComplete.finalStandings")}
          </h2>
          <Podium players={sortedPlayers} />
          {sortedPlayers.length > 3 && (
            <div className="space-y-2">
              {sortedPlayers.slice(3).map((player, idx) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
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
        {!isMobile && (
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={onNewGame}>
              {t("gameComplete.newGame")}
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="mt-8">
        <DetailsTab />
      </div>

      {/* Mobile Bottom Navigation Bar for Game Complete */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container max-w-2xl mx-auto">
            <Button className="w-full" size="lg" onClick={onNewGame}>
              {t("gameComplete.newGame")} <Home className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
