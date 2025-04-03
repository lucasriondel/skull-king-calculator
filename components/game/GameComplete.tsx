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
      <LanguageSwitcher />
      <Card>
        <CardHeader className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
          <CardTitle className="text-3xl">{t("gameComplete.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">
            {t("gameComplete.finalStandings")}
          </h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                        ? "bg-gray-300 text-black"
                        : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-xl font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
        {!isMobile && (
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={onNewGame}>
              {t("gameComplete.newGame")}
            </Button>
          </CardFooter>
        )}
      </Card>

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
