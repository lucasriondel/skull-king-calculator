import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #14: the podium bars rise in, one after another.
//
// Originally a CSS `podium-rise` keyframe staggered by animationDelay. The
// dramatic reveal reworked this: bars now grow from zero to their full height
// via a JS-driven height transition, sequenced 3rd → 2nd → 1st by
// useRevealSequence, with scores counting up alongside. The keyframe is gone,
// so these guards track the new mechanism — the intent (bars rise, staggered,
// nothing animates under reduced motion) is unchanged.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const podium = read("components/game/Podium.tsx");
const podiumColumn = read("components/game/PodiumColumn.tsx");
const gameComplete = read("components/game/GameComplete.tsx");
const tailwindConfig = read("tailwind.config.ts");

describe("podium bars rise in", () => {
  test("bars grow from zero height to their full height", () => {
    // Collapsed until revealed, then interpolated up to the rank's height.
    expect(podiumColumn).toMatch(/height: revealed \? fullHeight : 0/);
    expect(podiumColumn).toMatch(/transition: animate/);
    expect(podiumColumn).toMatch(/height \d+ms/);
  });

  test("bars reuse the repo ease-out curve", () => {
    expect(podiumColumn).toMatch(/cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
  });

  test("nothing animates when animate is false (reduced motion)", () => {
    // No transition at all, so the bar is simply at full height on first paint.
    expect(podiumColumn).toMatch(/transition: animate[\s\S]*?: undefined/);
  });
});

describe("podium reveals worst-placed first", () => {
  test("the winner is the last podium column revealed", () => {
    expect(podium).toMatch(/revealStep = top3\.length - 1 - rankIdx/);
    expect(podium).toMatch(/revealed=\{revealedCount > revealStep\}/);
  });

  test("podium keeps its 2nd / 1st / 3rd visual layout", () => {
    expect(podium).toMatch(/3: \[1, 0, 2\]/);
  });

  test("runners-up reveal before the podium, worst first", () => {
    expect(gameComplete).toMatch(
      /podiumRevealed = Math\.max\(0, revealed - runnersUp\.length\)/
    );
    expect(gameComplete).toMatch(
      /revealStep = runnersUp\.length - 1 - idx/
    );
  });
});

describe("scores count up", () => {
  test("podium and runner-up scores both animate from 0", () => {
    expect(podiumColumn).toMatch(/useCountUp/);
    expect(read("components/game/RunnerUpRow.tsx")).toMatch(/useCountUp/);
  });

  test("count-up only starts once its row is revealed", () => {
    expect(podiumColumn).toMatch(/active: revealed/);
  });
});

describe("the reveal is skipped under reduced motion", () => {
  test("GameComplete disables the sequence rather than delaying content", () => {
    expect(gameComplete).toMatch(/usePrefersReducedMotion/);
    expect(gameComplete).toMatch(/animate = !prefersReducedMotion/);
    expect(gameComplete).toMatch(/enabled: animate/);
  });
});

describe("tailwind config", () => {
  test("the retired podium-rise keyframe is gone", () => {
    expect(tailwindConfig).not.toContain("podium-rise");
  });

  test("every config animation duration stays under 300ms", () => {
    const durations = [...tailwindConfig.matchAll(/(\d+)ms/g)].map((m) =>
      Number(m[1])
    );
    expect(durations.length).toBeGreaterThan(0);
    expect(Math.max(...durations)).toBeLessThan(300);
  });
});
