import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { playerChartConfig, playerSeriesColor } from "@/lib/chart-players";
import { computePlayerStats } from "@/lib/round-stats";
import type { Player } from "@/lib/store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTranslation } from "react-i18next";

interface ZeroBidsChartProps {
  players: Player[];
}

/**
 * How many times each player bid zero.
 *
 * One bar per player rather than per round, so this is horizontal — player
 * names read straight across instead of being turned or truncated on a mobile
 * x-axis.
 */
export function ZeroBidsChart({ players }: ZeroBidsChartProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "GamePage.charts",
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  const stats = computePlayerStats(players);
  const data = players.map((player, playerIndex) => ({
    name: player.name,
    playerIndex,
    zeroBids: stats[playerIndex].zeroBids,
  }));

  const config = {
    ...playerChartConfig(players),
    zeroBids: { label: t("zeroBidsLabel") },
  };

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: Math.max(140, players.length * 40 + 24) }}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={80}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey="zeroBids" />}
        />
        <Bar
          dataKey="zeroBids"
          radius={4}
          isAnimationActive={!prefersReducedMotion}
        >
          {data.map((entry) => (
            <Cell
              key={entry.playerIndex}
              fill={playerSeriesColor(entry.playerIndex)}
            />
          ))}
          <LabelList
            dataKey="zeroBids"
            position="right"
            className="fill-muted-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
