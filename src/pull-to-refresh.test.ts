import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

// Regression guard for issue #7: the pull-to-refresh confirmation dialog
// introduced by #6 fired on every downward scroll and made the app unusable.
// The fix disables the native gesture with CSS `overscroll-behavior-y: none`
// and removes the dialog + touch-detection logic entirely.
describe("pull-to-refresh handling (issue #7)", () => {
  test("native pull-to-refresh is disabled via overscroll-behavior", () => {
    const css = readFileSync(join(root, "src/globals.css"), "utf8");
    expect(css).toMatch(/overscroll-behavior-y:\s*none/);
  });

  test("the pull-to-refresh confirmation dialog is no longer mounted", () => {
    const rootRoute = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
    expect(rootRoute).not.toContain("PullToRefreshGuard");
  });
});
