import { useEffect, useState } from "react";

/**
 * Drives a staged reveal: returns how many steps have been revealed so far,
 * advancing by one every `intervalMs` until all `count` steps are out.
 *
 * Under reduced motion the whole sequence is skipped — every step is revealed
 * on the first render, so nothing animates in and nothing is withheld.
 */
export function useRevealSequence(
  count: number,
  intervalMs: number,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const [revealed, setRevealed] = useState(enabled ? 0 : count);

  useEffect(() => {
    if (!enabled) {
      setRevealed(count);
      return;
    }

    setRevealed(0);
    if (count <= 0) return;

    const id = setInterval(() => {
      setRevealed((n) => {
        if (n >= count) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [count, intervalMs, enabled]);

  return revealed;
}
