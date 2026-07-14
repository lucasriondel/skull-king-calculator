import { useEffect, useRef, useState } from "react";

// Ease-out cubic: fast off the line, settling onto the final value. Gives the
// score a sense of momentum rather than a linear tick.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 up to `target` over `durationMs`, driven by rAF.
 *
 * Returns `target` immediately when `active` is false (nothing to count yet) or
 * when `enabled` is false (reduced motion — the final number, no animation).
 * Scores can be negative in Skull King, so this handles counting down too.
 */
export function useCountUp(
  target: number,
  durationMs: number,
  { active = true, enabled = true }: { active?: boolean; enabled?: boolean } = {}
) {
  const [value, setValue] = useState(active && enabled ? 0 : target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !active) {
      setValue(target);
      return;
    }

    const start = performance.now();
    setValue(0);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      // `+ 0` normalises -0 (Math.round of a negative score at t=0) back to 0.
      setValue(Math.round(target * easeOutCubic(t)) + 0);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs, active, enabled]);

  return value;
}
