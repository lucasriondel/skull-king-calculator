import { describe, expect, test } from "bun:test";
import { PULL_THRESHOLD_PX, detectPullTrigger } from "./use-pull-to-refresh-confirm";

describe("detectPullTrigger", () => {
  test("returns false when no startY recorded", () => {
    expect(detectPullTrigger({ startY: null, triggered: false }, 200)).toBe(false);
  });

  test("returns false when already triggered", () => {
    expect(detectPullTrigger({ startY: 0, triggered: true }, 500)).toBe(false);
  });

  test("returns false when pull distance below threshold", () => {
    const state = { startY: 100, triggered: false };
    expect(detectPullTrigger(state, 100 + PULL_THRESHOLD_PX)).toBe(false);
    expect(detectPullTrigger(state, 100 + PULL_THRESHOLD_PX - 1)).toBe(false);
  });

  test("returns true when pull distance exceeds threshold", () => {
    const state = { startY: 100, triggered: false };
    expect(detectPullTrigger(state, 100 + PULL_THRESHOLD_PX + 1)).toBe(true);
  });

  test("returns false on upward swipe (negative delta)", () => {
    const state = { startY: 300, triggered: false };
    expect(detectPullTrigger(state, 100)).toBe(false);
  });

  test("respects custom threshold", () => {
    const state = { startY: 0, triggered: false };
    expect(detectPullTrigger(state, 30, 20)).toBe(true);
    expect(detectPullTrigger(state, 30, 40)).toBe(false);
  });
});
