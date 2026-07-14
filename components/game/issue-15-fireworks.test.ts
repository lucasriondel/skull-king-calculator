import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #15: One-shot fireworks celebration behind the trophy card on the
// game-complete screen. Dependency-free, deterministic geometry (no
// Math.random()), animates transform/opacity only, gated behind `motion-safe:`
// so reduced-motion users see nothing. The ~900ms firework duration is an
// intentional exemption from the sub-300ms UI budget (a win celebration is
// exempt — AUDIT §2). Content-based regression guards, matching the
// issue-8/9/14 convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const fireworks = read("components/game/Fireworks.tsx");
const gameComplete = read("components/game/GameComplete.tsx");
const tailwindConfig = read("tailwind.config.ts");

describe("fireworks overlay is decorative and non-blocking", () => {
  test("overlay is fixed, pointer-events-none, and behind the card (z-0)", () => {
    expect(fireworks).toMatch(/fixed/);
    expect(fireworks).toMatch(/pointer-events-none/);
    expect(fireworks).toMatch(/z-0/);
  });

  test("the trophy card is lifted above the overlay so it stays on top", () => {
    expect(gameComplete).toMatch(/<Fireworks\s*\/>/);
    expect(gameComplete).toMatch(/z-10/);
  });
});

describe("fireworks are gated behind motion-safe", () => {
  test("nothing renders under reduced motion (hidden, shown only motion-safe)", () => {
    expect(fireworks).toMatch(/hidden/);
    expect(fireworks).toMatch(/motion-safe:block/);
  });

  test("particles animate only under motion-safe", () => {
    expect(fireworks).toMatch(/motion-safe:animate-firework/);
  });
});

describe("fireworks are deterministic and transform/opacity only", () => {
  test("no Math.random() anywhere in the component", () => {
    expect(fireworks).not.toMatch(/Math\.random/);
  });

  test("particle geometry is computed deterministically (trig, not random)", () => {
    expect(fireworks).toMatch(/Math\.(cos|sin)/);
  });

  test("three bursts staggered ~250ms apart", () => {
    expect(fireworks).toMatch(/250/);
  });
});

describe("firework animation is defined", () => {
  test("keyframe exists and shrinks particles to scale 0.4 (never scale 0)", () => {
    expect(tailwindConfig).toContain("'firework'");
    expect(tailwindConfig).toMatch(/scale\(0\.4\)/);
    expect(tailwindConfig).not.toMatch(/scale\(0\)/);
  });

  test("firework runs ~900ms — the celebration exemption above the UI budget", () => {
    expect(tailwindConfig).toMatch(/firework[^']*900ms/);
  });
});
