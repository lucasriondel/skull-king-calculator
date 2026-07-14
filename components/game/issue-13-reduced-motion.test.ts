import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Issue #13: Reduced-motion killswitch for the shadcn/Radix animation layer.
// tailwindcss-animate ships no prefers-reduced-motion handling, so every Radix
// overlay (dropdown, popover, select, dialog, tooltip) still zoom/slide/rotates
// under reduced motion. A single global rule in globals.css neutralizes the
// plugin's --tw-enter-*/--tw-exit-* transform custom properties while keeping
// the opacity fade. Content-based regression guard (no DOM render), matching
// the existing issue-8/issue-9 convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const globals = read("src/globals.css");

// Isolate the reduced-motion block for the killswitch assertions.
const reducedMotionBlock =
  globals.match(
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?}\s*}/
  )?.[0] ?? "";

describe("reduced-motion killswitch", () => {
  test("globals.css has a prefers-reduced-motion: reduce media query", () => {
    expect(reducedMotionBlock).not.toBe("");
  });

  test("killswitch is scoped to tailwindcss-animate's enter/exit utilities", () => {
    expect(reducedMotionBlock).toMatch(/\.animate-in/);
    expect(reducedMotionBlock).toMatch(/\.animate-out/);
  });

  test("neutralizes every transform custom property with !important", () => {
    for (const prop of [
      "--tw-enter-translate-x",
      "--tw-enter-translate-y",
      "--tw-enter-scale",
      "--tw-enter-rotate",
      "--tw-exit-translate-x",
      "--tw-exit-translate-y",
      "--tw-exit-scale",
      "--tw-exit-rotate",
    ]) {
      expect(reducedMotionBlock).toMatch(
        new RegExp(`${prop}:\\s*[^;]*!important`)
      );
    }
  });

  test("keeps the opacity fade (does not touch --tw-*-opacity)", () => {
    expect(reducedMotionBlock).not.toMatch(/--tw-enter-opacity/);
    expect(reducedMotionBlock).not.toMatch(/--tw-exit-opacity/);
  });
});
