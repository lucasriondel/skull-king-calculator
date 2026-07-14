import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Issue #9: Frontend feel — press feedback + enter/exit animations.
// Design-engineering principles: custom ease-out, sub-300ms, no
// `transition: all`, reduced-motion aware. Content-based regression guards
// (no DOM render), matching the existing frontend-fixes/issue-8 convention.

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const button = read("components/ui/button.tsx");
const numberSelector = read("components/game/NumberSelector.tsx");
const gameModesRoute = read("src/routes/$locale/game-modes.tsx");
const tabs = read("components/ui/tabs.tsx");
const playerCard = read("components/game/PlayerCard.tsx");
const tailwindConfig = read("tailwind.config.ts");

// Recursively collect every source file under the app's own folders.
function collectSources(dirs: string[]): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
        files.push(full);
      }
    }
  };
  for (const d of dirs) walk(join(root, d));
  return files;
}

describe("press-scale feedback", () => {
  test("shared Button scales down on press", () => {
    expect(button).toMatch(/active:scale-\[0\.97\]/);
  });
  test("number-selector cells scale down on press", () => {
    expect(numberSelector).toMatch(/active:scale-\[0\.96\]/);
  });
  test("press scale is neutralized under reduced motion", () => {
    expect(button).toMatch(/motion-reduce:active:scale-100/);
    expect(numberSelector).toMatch(/motion-reduce:active:scale-100/);
  });
});

describe("no transition-all", () => {
  test("transition: all is gone from every app source file", () => {
    const offenders = collectSources(["src", "components"]).filter((f) =>
      /transition-all/.test(readFileSync(f, "utf8"))
    );
    expect(offenders).toEqual([]);
  });
  test("game-mode cards name explicit transition properties", () => {
    expect(gameModesRoute).toMatch(/transition-\[box-shadow,background-color\]/);
  });
});

describe("tab content fades in", () => {
  test("TabsContent uses a motion-safe enter animation with reduced-motion fade", () => {
    expect(tabs).toMatch(/motion-safe:animate-tab-in/);
    expect(tabs).toMatch(/motion-reduce:animate-fade-in/);
  });
});

describe("score badge soft enter", () => {
  test("score badge animates in, with reduced-motion fade fallback", () => {
    expect(playerCard).toMatch(/motion-safe:animate-score-in/);
    expect(playerCard).toMatch(/motion-reduce:animate-fade-in/);
  });
});

describe("hover gating for touch devices", () => {
  test("tailwind gates hover behind hover-capable pointers", () => {
    expect(tailwindConfig).toMatch(/hoverOnlyWhenSupported:\s*true/);
  });
});

describe("reduced-motion-aware animations are defined", () => {
  test("custom enter keyframes exist (ease-out, sub-300ms)", () => {
    for (const name of ["fade-in", "tab-in", "score-in"]) {
      expect(tailwindConfig).toContain(`'${name}'`);
    }
    // sub-300ms durations only — except the win-celebration fireworks
    // (issue #15), which are an intentional exemption from the UI budget
    // (AUDIT §2). Drop any line mentioning `firework` before scanning.
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
