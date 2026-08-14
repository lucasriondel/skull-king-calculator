import type { ChartConfig } from "@/components/ui/chart";
import { playerColor } from "@/lib/player-colors";
import type { Player } from "@/lib/store";

/**
 * Recharts needs a concrete color string per series, but player colors are
 * stored as raw HSL channels with a separate value per theme.
 *
 * `ChartContainer` bridges the two: given a `theme: { light, dark }` entry it
 * emits `--color-<key>` under the right selector, so a series can be drawn with
 * `stroke="var(--color-p0)"` and follow the theme without a re-render — the
 * same trick `.player-tinted` uses in `globals.css`.
 */

/** Series key for a player, stable across sorts. Keyed by seat, like colors. */
export function playerSeriesKey(playerIndex: number): string {
  return `p${playerIndex}`;
}

export function playerChartConfig(players: Player[]): ChartConfig {
  const config: ChartConfig = {};
  players.forEach((player, index) => {
    const color = playerColor(index);
    config[playerSeriesKey(index)] = {
      label: player.name,
      theme: {
        light: `hsl(${color.light})`,
        dark: `hsl(${color.dark})`,
      },
    };
  });
  return config;
}

export function playerSeriesColor(playerIndex: number): string {
  return `var(--color-${playerSeriesKey(playerIndex)})`;
}
