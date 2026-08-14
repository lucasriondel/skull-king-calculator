import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { computePlayerStats } from "@/lib/round-stats";
import type { Player } from "@/lib/store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTranslation } from "react-i18next";

interface BidsWonLostChartProps {
  players: Player[];
}

/**
 * Bids met vs missed per player, as a stacked bar.
 *
 * The two series carry the meaning here, so this is the one chart that doesn't
 * use player colors — won/lost reads through the same success/destructive
 * tokens as the score badges in the details table, and colouring by player on
 * top of that would leave the two encodings fighting. The player is identified
 * by the axis label instead.
 */
export function BidsWonLostChart({ players }: BidsWonLostChartProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "GamePage.charts",
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  const stats = computePlayerStats(players);
  const data = players.map((player, playerIndex) => ({
    name: player.name,
    won: stats[playerIndex].bidsWon,
    lost: stats[playerIndex].bidsLost,
  }));

  const config = {
    won: { label: t("bidsWon"), theme: { light: "hsl(var(--success))", dark: "hsl(var(--success))" } },
    lost: {
      label: t("bidsLost"),
      theme: {
        light: "hsl(var(--destructive))",
        dark: "hsl(var(--destructive))",
      },
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: Math.max(160, players.length * 40 + 48) }}
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
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="won"
          stackId="bids"
          fill="var(--color-won)"
          radius={4}
          isAnimationActive={!prefersReducedMotion}
        >
          <LabelList
            dataKey="won"
            position="insideLeft"
            className="fill-background"
            fontSize={12}
            // A zero segment has no box to sit in, so its label would other-
            // wise float over the neighbouring colour.
            formatter={(value: number) => (value > 0 ? value : "")}
          />
        </Bar>
        <Bar
          dataKey="lost"
          stackId="bids"
          fill="var(--color-lost)"
          radius={4}
          isAnimationActive={!prefersReducedMotion}
        >
          <LabelList
            dataKey="lost"
            position="insideRight"
            className="fill-background"
            fontSize={12}
            formatter={(value: number) => (value > 0 ? value : "")}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
