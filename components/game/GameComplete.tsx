import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/use-mobile";
import LanguageSwitcher from "@/components/language-switcher";
import { DetailsTab } from "@/components/game/DetailsTab";
import { Podium } from "@/components/game/Podium";
import { RunnerUpRow } from "@/components/game/RunnerUpRow";
import { Fireworks } from "@/components/game/Fireworks";
import { useRevealSequence } from "@/hooks/use-reveal-sequence";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface Player {
  name: string;
  score: number;
}

interface GameCompleteProps {
  players: Player[];
  onNewGame: () => void;
}

// The whole reveal is budgeted, not the per-player gap: a fixed gap makes an
// 8-player table run ~14s, which is well past the point of tension. Aim for the
// winner landing around this mark, with a floor so the podium keeps its beat.
const TARGET_REVEAL_MS = 7000;
const MIN_INTERVAL_MS = 700;
const MAX_INTERVAL_MS = 1800;

function revealIntervalFor(playerCount: number) {
  if (playerCount <= 0) return MAX_INTERVAL_MS;
  const even = TARGET_REVEAL_MS / playerCount;
  return Math.round(Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, even)));
}

export function GameComplete({ players, onNewGame }: GameCompleteProps) {
  const { t } = useTranslation("translation", { keyPrefix: "GamePage" });
  const isMobile = useMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = !prefersReducedMotion;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // One sequence over every player, revealed worst-placed first. Runners-up
  // (4th and below) come out in reverse order, then the podium counts 3rd →
  // 2nd → 1st, so the winner is always the final beat.
  const intervalMs = revealIntervalFor(sortedPlayers.length);
  const revealed = useRevealSequence(sortedPlayers.length, intervalMs, {
    enabled: animate,
  });

  // Each score settles inside its own slot, before the next player lands.
  const countUpMs = Math.round(intervalMs * 0.7);

  const runnersUp = sortedPlayers.slice(3);
  const podiumRevealed = Math.max(0, revealed - runnersUp.length);

  // The winner is the last player revealed; the sequencer fires its first step
  // one interval in, so the winner lands after `length` intervals.
  const winnerRevealMs = sortedPlayers.length * intervalMs;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      {/* Decorative one-shot celebration; fixed canvas over the card,
          pointer-events-none so it never intercepts clicks (issue #15).
          Held until the winner's column lands, so it punctuates the reveal. */}
      <Fireworks startDelayMs={animate ? winnerRevealMs : 0} />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <Card className="relative z-10">
        <CardHeader className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
          <CardTitle className="text-3xl">{t("gameComplete.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">
            {t("gameComplete.finalStandings")}
          </h2>
          <Podium
            players={sortedPlayers}
            revealedCount={podiumRevealed}
            countUpMs={countUpMs}
            animate={animate}
          />
          {runnersUp.length > 0 && (
            <div className="space-y-2">
              {runnersUp.map((player, idx) => {
                // Rendered best-to-worst down the page, but revealed worst
                // first — so the last row is reveal step 0.
                const revealStep = runnersUp.length - 1 - idx;
                return (
                  <RunnerUpRow
                    key={player.name}
                    name={player.name}
                    score={player.score}
                    place={idx + 4}
                    revealed={revealed > revealStep}
                    countUpMs={countUpMs}
                    animate={animate}
                  />
                );
              })}
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
