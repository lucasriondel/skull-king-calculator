import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { playerChartConfig, playerSeriesKey, playerSeriesColor } from "@/lib/chart-players";
import { computePlayerStats, playedRoundCount } from "@/lib/round-stats";
import type { Player } from "@/lib/store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTranslation } from "react-i18next";

interface ScoreProgressionChartProps {
  players: Player[];
}

/**
 * Running total per player, round by round — the shape of the whole game.
 *
 * One line per player in their identity color, so a player tracks the same hue
 * here as on their card, the scoreboard and the podium.
 */
export function ScoreProgressionChart({ players }: ScoreProgressionChartProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "GamePage.charts",
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  const roundCount = playedRoundCount(players);
  const stats = computePlayerStats(players);

  const data = Array.from({ length: roundCount }, (_, round) => {
    const point: Record<string, number | string> = { round: round + 1 };
    players.forEach((_, playerIndex) => {
      point[playerSeriesKey(playerIndex)] =
        stats[playerIndex].cumulativeScores[round];
    });
    return point;
  });

  return (
    <ChartContainer
      config={playerChartConfig(players)}
      className="aspect-auto h-[260px] w-full"
    >
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="round"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${t("roundShort")}${value}`}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => `${t("round")} ${value}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {players.map((_, playerIndex) => (
          <Line
            key={playerIndex}
            dataKey={playerSeriesKey(playerIndex)}
            type="monotone"
            stroke={playerSeriesColor(playerIndex)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={!prefersReducedMotion}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
