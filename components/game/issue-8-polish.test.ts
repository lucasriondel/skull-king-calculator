import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #8: Frontend polish — debug/console cleanup, tabular numbers, font
// smoothing, balanced/pretty text wrapping, i18n gaps, logo outline, dead props.
// These are content-based regression guards (no DOM render), matching the
// existing frontend-fixes.test.ts convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const gameRoute = read("src/routes/$locale/game.tsx");
const playersRoute = read("src/routes/$locale/players.tsx");
const gameModesRoute = read("src/routes/$locale/game-modes.tsx");
const globalsCss = read("src/globals.css");
const playerCard = read("components/game/PlayerCard.tsx");
// Podium score markup lives in PodiumColumn since the dramatic reveal split it out.
const podiumColumn = read("components/game/PodiumColumn.tsx");
const scoresTab = read("components/game/ScoresTab.tsx");
// Standings-row markup lives in ScoreRow, shared by the mid-game scoreboard and
// the game-complete reveal.
const scoreRow = read("components/game/ScoreRow.tsx");
const numberSelector = read("components/game/NumberSelector.tsx");
const en = JSON.parse(read("messages/en.json"));
const fr = JSON.parse(read("messages/fr.json"));

describe("debug/console cleanup", () => {
  test("no console.log remains in the game route", () => {
    expect(gameRoute).not.toMatch(/console\.log/);
  });
});

describe("tabular numbers on live/updating numbers", () => {
  test("player score badge uses tabular-nums", () => {
    expect(playerCard).toMatch(/tabular-nums/);
  });
  test("podium scores use tabular-nums", () => {
    // Doubly load-bearing now: these digits count up, so a proportional font
    // would make the score jitter as it climbs.
    expect(podiumColumn).toMatch(/tabular-nums/);
  });
  test("scores tab rows use tabular-nums", () => {
    expect(scoreRow).toMatch(/tabular-nums/);
  });
  test("number-selector cells use tabular-nums", () => {
    expect(numberSelector).toMatch(/tabular-nums/);
  });
});

describe("font smoothing", () => {
  test("body is antialiased", () => {
    expect(globalsCss).toMatch(/-webkit-font-smoothing:\s*antialiased/);
  });
});

describe("text wrapping", () => {
  test("headings use balanced wrapping", () => {
    expect(gameModesRoute).toMatch(/text-balance/);
    expect(playersRoute).toMatch(/text-balance/);
  });
  test("mode descriptions use pretty wrapping", () => {
    expect(gameModesRoute).toMatch(/text-pretty/);
  });
});

describe("i18n gaps", () => {
  test("player-name placeholder is translated, not hardcoded", () => {
    expect(playersRoute).not.toMatch(/placeholder=\{?"Player name"/);
    expect(playersRoute).toMatch(/placeholder=\{t\(/);
  });
  test("drag aria-label is translated, not hardcoded", () => {
    expect(playersRoute).not.toMatch(/aria-label="Drag to reorder"/);
    expect(playersRoute).toMatch(/aria-label=\{t\(/);
  });
  test("new keys exist in both EN and FR", () => {
    expect(en.PlayersPage.playerNamePlaceholder).toBeTruthy();
    expect(en.PlayersPage.dragToReorder).toBeTruthy();
    expect(fr.PlayersPage.playerNamePlaceholder).toBeTruthy();
    expect(fr.PlayersPage.dragToReorder).toBeTruthy();
  });
});

describe("logo outline", () => {
  test("logo images have a subtle themed 1px outline", () => {
    expect(playersRoute).toMatch(/ring-1 ring-black\/10 dark:ring-white\/10/);
    expect(gameModesRoute).toMatch(/ring-1 ring-black\/10 dark:ring-white\/10/);
  });
});

describe("dead props removed", () => {
  test("ScoresTab no longer declares onBackToBids", () => {
    expect(scoresTab).not.toMatch(/onBackToBids/);
  });
});
