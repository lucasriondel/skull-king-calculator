import { describe, expect, test } from "bun:test";
import {
  playerChartConfig,
  playerSeriesColor,
  playerSeriesKey,
} from "@/lib/chart-players";
import { PLAYER_COLORS, playerColor } from "@/lib/player-colors";
import type { Player } from "@/lib/store";

const players: Player[] = [
  { name: "Anne", score: 0, rounds: [] },
  { name: "Blackbeard", score: 0, rounds: [] },
];

describe("playerChartConfig", () => {
  test("labels each series with the player's name", () => {
    const config = playerChartConfig(players);
    expect(config[playerSeriesKey(0)].label).toBe("Anne");
    expect(config[playerSeriesKey(1)].label).toBe("Blackbeard");
  });

  test("ships both themes so ChartStyle can emit a var per theme", () => {
    const config = playerChartConfig(players);
    // `ChartStyle` only emits `--color-<key>` for entries carrying `theme` or
    // `color`; without this the series would render with no fill at all.
    const entry = config[playerSeriesKey(0)];
    expect(entry.theme).toBeDefined();
    expect(entry.theme?.light).toBe(`hsl(${PLAYER_COLORS[0].light})`);
    expect(entry.theme?.dark).toBe(`hsl(${PLAYER_COLORS[0].dark})`);
  });

  test("series colors match the player's identity color", () => {
    const config = playerChartConfig(players);
    players.forEach((_, index) => {
      const expected = playerColor(index);
      expect(config[playerSeriesKey(index)].theme?.light).toBe(
        `hsl(${expected.light})`
      );
    });
  });

  test("keys are seat-based, so a sorted view can't shuffle colors", () => {
    expect(playerSeriesKey(0)).toBe("p0");
    expect(playerSeriesKey(7)).toBe("p7");
  });

  test("series color reads the var ChartStyle defines", () => {
    expect(playerSeriesColor(3)).toBe("var(--color-p3)");
  });

  test("covers a full eight-player table without collisions", () => {
    const table: Player[] = Array.from({ length: 8 }, (_, i) => ({
      name: `P${i}`,
      score: 0,
      rounds: [],
    }));
    const config = playerChartConfig(table);
    const lights = Object.values(config).map((entry) => entry.theme?.light);
    expect(new Set(lights).size).toBe(8);
  });
});
