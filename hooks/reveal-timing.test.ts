import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Timing guards for the dramatic game-complete reveal: last place first, the
// winner last, fireworks landing on the winner. The ordering maths lives in
// GameComplete/Podium and is easy to invert silently, so it is pinned here.

const root = join(import.meta.dir, "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const gameComplete = read("components/game/GameComplete.tsx");
const countUp = read("hooks/use-count-up.ts");
const revealSequence = read("hooks/use-reveal-sequence.ts");

// Mirrors revealIntervalFor() in GameComplete.tsx.
const TARGET_REVEAL_MS = 7000;
const MIN_INTERVAL_MS = 700;
const MAX_INTERVAL_MS = 1800;
const revealIntervalFor = (n: number) =>
  n <= 0
    ? MAX_INTERVAL_MS
    : Math.round(
        Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, TARGET_REVEAL_MS / n))
      );

/** Reveal order as rendered: runners-up worst-first, then podium 3rd → 2nd → 1st. */
function revealOrder(playerCount: number) {
  const places = Array.from({ length: playerCount }, (_, i) => i + 1);
  const runnersUp = places.slice(3);
  const top3 = places.slice(0, 3);
  const order: number[] = [];

  for (let revealed = 1; revealed <= playerCount; revealed++) {
    const podiumRevealed = Math.max(0, revealed - runnersUp.length);
    runnersUp.forEach((place, idx) => {
      if (revealed - 1 === runnersUp.length - 1 - idx) order.push(place);
    });
    top3.forEach((place, rankIdx) => {
      if (podiumRevealed - 1 === top3.length - 1 - rankIdx) order.push(place);
    });
  }
  return order;
}

describe("reveal order builds to the winner", () => {
  test("worst place is revealed first and the winner last", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 8]) {
      const order = revealOrder(n);
      expect(order).toHaveLength(n);
      expect(order[0]).toBe(n); // last place opens
      expect(order.at(-1)).toBe(1); // winner closes
    }
  });

  test("places descend monotonically — no player revealed twice or skipped", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 8]) {
      expect(revealOrder(n)).toEqual(
        Array.from({ length: n }, (_, i) => n - i)
      );
    }
  });
});

describe("pacing stays watchable as the table grows", () => {
  test("a full table lands the winner near the target, never dragging", () => {
    for (const n of [4, 5, 6, 7, 8, 10]) {
      const total = n * revealIntervalFor(n);
      expect(total).toBeLessThanOrEqual(TARGET_REVEAL_MS + MAX_INTERVAL_MS);
    }
    // The 8-player case regressed to ~14s under a fixed interval; guard it.
    expect(8 * revealIntervalFor(8)).toBeLessThanOrEqual(8000);
  });

  test("small tables keep a full dramatic beat per player", () => {
    for (const n of [1, 2, 3]) {
      expect(revealIntervalFor(n)).toBe(MAX_INTERVAL_MS);
    }
  });

  test("the interval never drops below the floor", () => {
    for (const n of [10, 20, 100]) {
      expect(revealIntervalFor(n)).toBeGreaterThanOrEqual(MIN_INTERVAL_MS);
    }
  });

  test("GameComplete's constants match the ones pinned here", () => {
    expect(gameComplete).toContain(`TARGET_REVEAL_MS = ${TARGET_REVEAL_MS}`);
    expect(gameComplete).toContain(`MIN_INTERVAL_MS = ${MIN_INTERVAL_MS}`);
    expect(gameComplete).toContain(`MAX_INTERVAL_MS = ${MAX_INTERVAL_MS}`);
  });

  test("each score settles before the next player lands", () => {
    expect(gameComplete).toMatch(/countUpMs = Math\.round\(intervalMs \* 0\.7\)/);
  });
});

describe("fireworks punctuate the winner", () => {
  test("they are held until the winner's column lands", () => {
    expect(gameComplete).toMatch(
      /winnerRevealMs = sortedPlayers\.length \* intervalMs/
    );
    expect(gameComplete).toMatch(/startDelayMs=\{animate \? winnerRevealMs : 0\}/);
  });
});

describe("reduced motion skips the sequence rather than delaying content", () => {
  test("every step is revealed immediately when disabled", () => {
    // Withholding scores behind a timer would hide content, not just motion.
    expect(revealSequence).toMatch(/useState\(enabled \? 0 : count\)/);
    expect(revealSequence).toMatch(/if \(!enabled\)[\s\S]*?setRevealed\(count\)/);
  });

  test("count-up jumps straight to the final score when disabled", () => {
    expect(countUp).toMatch(/if \(!enabled \|\| !active\)[\s\S]*?setValue\(target\)/);
  });
});

describe("count-up handles real Skull King scores", () => {
  // Scores go negative, and the ease-out is applied to the target directly
  // rather than to an absolute range — so counting down must work too.
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  // `+ 0` mirrors the -0 normalisation in use-count-up.ts.
  const valueAt = (target: number, t: number) =>
    Math.round(target * easeOutCubic(t)) + 0;

  test("starts at 0 and finishes exactly on the target", () => {
    for (const target of [210, 0, -75, 1]) {
      expect(valueAt(target, 0)).toEqual(0);
      expect(valueAt(target, 1)).toEqual(target);
    }
  });

  test("a negative score never displays as -0", () => {
    expect(Object.is(valueAt(-75, 0), -0)).toBe(false);
    expect(read("hooks/use-count-up.ts")).toMatch(/easeOutCubic\(t\)\) \+ 0/);
  });

  test("decelerates — more ground covered early than late", () => {
    const firstHalf = valueAt(200, 0.5) - valueAt(200, 0);
    const secondHalf = valueAt(200, 1) - valueAt(200, 0.5);
    expect(firstHalf).toBeGreaterThan(secondHalf);
  });

  test("a negative score counts down without overshooting", () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map((t) => valueAt(-75, t));
    expect(steps[0]).toEqual(0);
    expect(steps.at(-1)).toEqual(-75);
    for (const v of steps) expect(v).toBeGreaterThanOrEqual(-75);
  });
});
