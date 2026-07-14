import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce`.
 *
 * Most motion in this codebase is gated with Tailwind's `motion-safe:` variant.
 * This hook is for the cases CSS cannot reach — a canvas animation, or a JS
 * timing sequence that would otherwise withhold content behind a delay.
 */
export function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefers;
}
