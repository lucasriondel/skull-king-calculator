import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #14: Animate the podium bars rising in (staggered).
// Bars start pushed down by a fraction of their own height and transparent,
// then settle; 1st/2nd/3rd offset ~60ms apart in display order. Percentage
// translate (no px), reuses the repo ease-out curve, stays under 300ms, and
// falls back to opacity-only `fade-in` under reduced motion. Content-based
// regression guards, matching the issue-8/issue-9 convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const podium = read("components/game/Podium.tsx");
const tailwindConfig = read("tailwind.config.ts");

describe("podium bars rise in", () => {
  test("bars use a motion-safe rise animation with reduced-motion fade fallback", () => {
    expect(podium).toMatch(/motion-safe:animate-podium-rise/);
    expect(podium).toMatch(/motion-reduce:animate-fade-in/);
  });

  test("bars are staggered ~60ms apart in display order", () => {
    expect(podium).toMatch(/animationDelay/);
    expect(podium).toMatch(/60/);
  });
});

describe("podium-rise animation is defined", () => {
  test("keyframe exists and translates by a percentage (no hardcoded px)", () => {
    expect(tailwindConfig).toContain("'podium-rise'");
    // A rise from below: positive percentage translateY, not px.
    expect(tailwindConfig).toMatch(/translateY\(\d+%\)/);
  });

  test("animation reuses the repo ease-out curve and holds at its offset (fill-mode both)", () => {
    expect(tailwindConfig).toMatch(
      /podium-rise[^']*cubic-bezier\(0\.22, 1, 0\.36, 1\)[^']*both/
    );
  });

  test("every config animation duration stays under 300ms", () => {
    // The win-celebration fireworks (issue #15) are an intentional exemption
    // from the sub-300ms UI budget (AUDIT §2); drop `firework` lines first.
    const scannable = tailwindConfig
      .split("\n")
      .filter((line) => !/firework/i.test(line))
      .join("\n");
    const durations = [...scannable.matchAll(/(\d+)ms/g)].map((m) =>
      Number(m[1])
    );
    expect(durations.length).toBeGreaterThan(0);
    expect(Math.max(...durations)).toBeLessThan(300);
  });
});
