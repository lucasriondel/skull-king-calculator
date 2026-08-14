import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  playerChartConfig,
  playerSeriesColor,
  playerSeriesKey,
} from "@/lib/chart-players";
import { computePlayerStats, playedRoundCount } from "@/lib/round-stats";
import type { Player } from "@/lib/store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTranslation } from "react-i18next";

interface BonusPerRoundChartProps {
  players: Player[];
}

/**
 * Bonus points credited per round, grouped by round.
 *
 * These are the bonuses that actually scored, not the ones on the table: a
 * blown bid forfeits its captures, so those rounds read zero here even when
 * the player caught a Skull King.
 */
export function BonusPerRoundChart({ players }: BonusPerRoundChartProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "GamePage.charts",
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  const roundCount = playedRoundCount(players);
  const stats = computePlayerStats(players);

  const data = Array.from({ length: roundCount }, (_, round) => {
    const point: Record<string, number | string> = { round: round + 1 };
    players.forEach((_, playerIndex) => {
      point[playerSeriesKey(playerIndex)] = stats[playerIndex].bonusPerRound[round];
    });
    return point;
  });

  return (
    <ChartContainer
      config={playerChartConfig(players)}
      className="aspect-auto h-[260px] w-full"
    >
      <BarChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="round"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${t("roundShort")}${value}`}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => `${t("round")} ${value}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {players.map((_, playerIndex) => (
          <Bar
            key={playerIndex}
            dataKey={playerSeriesKey(playerIndex)}
            fill={playerSeriesColor(playerIndex)}
            radius={2}
            isAnimationActive={!prefersReducedMotion}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
