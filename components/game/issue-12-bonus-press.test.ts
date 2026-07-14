import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #12: Add press-scale feedback to bonus toggles.
// The shared `toggleClass` used by every bonus ToggleGroupItem (color
// bonuses, treasure/mermaid/pirate, skull king) must depress on press by
// the same amount as the number-selector cells beside it (0.96), driven
// off an explicit transform transition (no transition-all), and be
// neutralized under prefers-reduced-motion. Content-based regression
// guards, matching the existing issue-9-feel convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const bonusControls = read("components/game/BonusControls.tsx");

// The shared toggle base class string all bonus toggles spread.
const toggleClass =
  bonusControls.match(/const toggleClass\s*=\s*([\s\S]*?);/)?.[1] ?? "";

describe("bonus toggle press-scale feedback", () => {
  test("shared toggleClass depresses to 0.96 on press", () => {
    expect(toggleClass).toMatch(/active:scale-\[0\.96\]/);
  });
  test("depress matches number-selector cells (both 0.96)", () => {
    const numberSelector = read("components/game/NumberSelector.tsx");
    expect(numberSelector).toMatch(/active:scale-\[0\.96\]/);
    expect(toggleClass).toMatch(/active:scale-\[0\.96\]/);
  });
  test("press scale is neutralized under reduced motion", () => {
    expect(toggleClass).toMatch(/motion-reduce:active:scale-100/);
  });
  test("scale is driven off an explicit transform transition, not transition-all", () => {
    expect(toggleClass).toMatch(/transition-\[[^\]]*transform[^\]]*\]/);
    expect(toggleClass).not.toMatch(/transition-all/);
  });
});
