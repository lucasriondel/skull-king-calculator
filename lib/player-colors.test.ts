import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PLAYER_COLORS,
  playerColor,
  playerColorVars,
  withPlayerColorIndex,
} from "./player-colors";

const root = join(import.meta.dir, "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("palette", () => {
  test("every entry ships a light and a dark channel triple", () => {
    for (const color of PLAYER_COLORS) {
      expect(color.light).toMatch(/^\d+ \d+% \d+%$/);
      expect(color.dark).toMatch(/^\d+ \d+% \d+%$/);
    }
  });

  test("hues are distinct so adjacent players never collide", () => {
    const hues = PLAYER_COLORS.map((c) => Number(c.light.split(" ")[0]));
    expect(new Set(hues).size).toBe(PLAYER_COLORS.length);
  });

  test("covers the eight-player cap without reusing a color", () => {
    expect(PLAYER_COLORS.length).toBeGreaterThanOrEqual(8);
  });

  test("consecutive seats are far enough apart in hue to tell apart", () => {
    // Seats are handed out in palette order, so neighbours in this list end up
    // as neighbours in the player list — where confusable hues hurt most.
    const hues = PLAYER_COLORS.map((c) => Number(c.light.split(" ")[0]));
    for (let i = 1; i < hues.length; i++) {
      const raw = Math.abs(hues[i] - hues[i - 1]);
      const distance = Math.min(raw, 360 - raw);
      expect(distance).toBeGreaterThan(30);
    }
  });
});

describe("playerColor", () => {
  test("every seat in a full eight-player game gets its own color", () => {
    // Games cap at eight players, so the palette covers every seat outright —
    // nobody should ever share a color with another player at the table.
    const names = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => playerColor(i).name);
    expect(new Set(names).size).toBe(8);
  });

  test("wraps around past the end of the palette", () => {
    // Unreachable at the eight-player cap, but the indexing must stay total.
    expect(playerColor(8).name).toBe(playerColor(0).name);
  });

  test("never returns undefined for a junk index", () => {
    expect(playerColor(-1)).toBeDefined();
    expect(playerColor(Number.NaN)).toBeDefined();
    expect(playerColor(1.5)).toBeDefined();
  });
});

describe("playerColorVars", () => {
  test("publishes both themes' channels for the CSS to pick from", () => {
    const vars = playerColorVars(0) as Record<string, string>;
    expect(vars["--player-color-light"]).toBe(PLAYER_COLORS[0].light);
    expect(vars["--player-color-dark"]).toBe(PLAYER_COLORS[0].dark);
  });
});

describe("withPlayerColorIndex", () => {
  test("tags each player with their position before sorting detaches it", () => {
    const players = [
      { name: "Lucas", score: 10 },
      { name: "Marion", score: 40 },
      { name: "Théo", score: 20 },
    ];
    const sorted = [...withPlayerColorIndex(players)].sort(
      (a, b) => b.score - a.score
    );

    // Marion sorts first but keeps seat 1 — colors must not follow the ranking.
    expect(sorted[0].name).toBe("Marion");
    expect(sorted[0].colorIndex).toBe(1);
    expect(sorted.map((p) => p.colorIndex).sort()).toEqual([0, 1, 2]);
  });
});

describe("wiring", () => {
  test("the CSS resolves the dark channel under the dark theme", () => {
    const css = read("src/globals.css");
    expect(css).toMatch(/--player-color:\s*var\(--player-color-light\)/);
    expect(css).toMatch(
      /\.dark \.player-tinted\s*\{\s*--player-color:\s*var\(--player-color-dark\)/
    );
  });

  test("selected number cells stay untinted so bg-primary reads clearly", () => {
    const selector = read("components/game/NumberSelector.tsx");
    const selectedLine = selector
      .split("\n")
      .find((line) => line.includes("bg-primary text-primary-foreground"));
    expect(selectedLine).toBeDefined();
    expect(selectedLine).not.toMatch(/player-tinted-cell/);
  });

  test("sorted views carry the seat index rather than the row index", () => {
    // A regression here silently recolors players every round.
    for (const rel of [
      "components/game/ScoresTab.tsx",
      "components/game/GameComplete.tsx",
    ]) {
      expect(read(rel)).toMatch(/withPlayerColorIndex/);
      expect(read(rel)).toMatch(/colorIndex=\{player\.colorIndex\}/);
    }
  });

  test("the details table colors its player names by seat", () => {
    // Details rows are already in seat order, so the row index is the color key.
    const detailsTab = read("components/game/DetailsTab.tsx");
    expect(detailsTab).toMatch(/PlayerNameCell/);
    expect(detailsTab).not.toMatch(/<TableCell>\{player\.name\}<\/TableCell>/);
    expect(read("components/game/PlayerNameCell.tsx")).toMatch(
      /player-tinted-name/
    );
  });

  test("the podium bar keeps its rank colors", () => {
    const podiumColumn = read("components/game/PodiumColumn.tsx");
    expect(podiumColumn).toMatch(/bg-yellow-500/);
    expect(podiumColumn).toMatch(/bg-gray-300/);
    expect(podiumColumn).toMatch(/bg-amber-700/);
  });
});
