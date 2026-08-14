import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BidsWonLostChart } from "@/components/game/charts/BidsWonLostChart";
import { BonusPerRoundChart } from "@/components/game/charts/BonusPerRoundChart";
import { ScoreProgressionChart } from "@/components/game/charts/ScoreProgressionChart";
import { ZeroBidsChart } from "@/components/game/charts/ZeroBidsChart";
import { playedRoundCount } from "@/lib/round-stats";
import type { Player } from "@/lib/store";
import { useTranslation } from "react-i18next";

interface GameChartsProps {
  players: Player[];
}

/**
 * The stats panel: score progression plus three breakdowns.
 *
 * Rendered on both the Details tab and the end-of-game screen, so it takes
 * players as a prop rather than reading the store — the final screen already
 * has its own sorted copy.
 */
export function GameCharts({ players }: GameChartsProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "GamePage.charts",
  });

  // Nothing to plot before the first round is scored, and a one-round line is
  // a single dot — but the per-player breakdowns are already meaningful, so
  // only the progression chart waits for a second round.
  const roundCount = playedRoundCount(players);
  if (roundCount === 0 || players.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {roundCount > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("progression")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreProgressionChart players={players} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bonusPerRound")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BonusPerRoundChart players={players} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bidsWonLost")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BidsWonLostChart players={players} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("zeroBids")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ZeroBidsChart players={players} />
        </CardContent>
      </Card>
    </div>
  );
}
