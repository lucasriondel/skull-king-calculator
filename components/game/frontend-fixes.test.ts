import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = import.meta.dir;
const gameHeader = readFileSync(join(dir, "GameHeader.tsx"), "utf8");
const bonusControls = readFileSync(join(dir, "BonusControls.tsx"), "utf8");

// Issue #11: GameHeader ignored light mode (hardcoded slate colors) and the
// mermaid/pirate +/- steppers had tiny (16x16) hit areas overlapping the
// toggle behind them.
describe("GameHeader light-mode theming (issue #11)", () => {
  test("does not use hardcoded slate colors", () => {
    expect(gameHeader).not.toMatch(/\bbg-slate-/);
    expect(gameHeader).not.toMatch(/\btext-slate-/);
    expect(gameHeader).not.toMatch(/\bborder-slate-/);
  });

  test("uses theme tokens that adapt to light and dark mode", () => {
    expect(gameHeader).toMatch(/\bbg-muted\b/);
    expect(gameHeader).toMatch(/\btext-muted-foreground\b/);
    expect(gameHeader).toMatch(/\bborder-border\b/);
  });
});

describe("BonusControls stepper hit areas (issue #11)", () => {
  test("steppers are no longer 16x16 (h-4 w-4)", () => {
    expect(bonusControls).not.toMatch(/\bh-4 w-4\b/);
  });

  test("steppers use a >=40px (size-10 / h-10 w-10) hit area", () => {
    expect(bonusControls).toMatch(/size-10|h-10 w-10/);
  });

  test("steppers are not absolutely positioned over the toggle", () => {
    // The old layout overlapped the toggle's hit zone with an absolute overlay.
    expect(bonusControls).not.toMatch(/absolute right-1/);
  });
});
