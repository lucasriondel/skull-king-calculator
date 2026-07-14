import { useEffect, useState } from "react";
import { Fireworks as FireworksCanvas } from "@fireworks-js/react";

// Issue #15: one-shot fireworks celebration on the game-complete screen.
//
// Canvas-backed (@fireworks-js/react) rather than CSS particles: it renders its
// own full-viewport canvas, so it is not subject to the card's stacking context.
// The overlay is fixed / pointer-events-none so the card, New Game button and
// language switcher stay clickable.
//
// Reduced motion is handled in JS, not `motion-safe:` — CSS cannot reach inside
// a canvas. We check prefers-reduced-motion and simply never mount the canvas,
// so reduced-motion users see nothing move at all.

export interface FireworksProps {
  /** How long rockets keep launching before the show stops. */
  durationMs?: number;
  /** Rockets launched per burst tick — the library's `intensity`. */
  intensity?: number;
  /** Explosion radius, roughly in particle spread. */
  explosion?: number;
  /** Particles per rocket. */
  particles?: number;
  /** Festive hue range, in degrees. */
  hue?: { min: number; max: number };
}

function usePrefersReducedMotion() {
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

export function Fireworks({
  durationMs = 6000,
  intensity = 30,
  explosion = 6,
  particles = 90,
  hue = { min: 0, max: 360 },
}: FireworksProps = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [done, setDone] = useState(false);

  // One-shot: stop launching after durationMs so the celebration doesn't run
  // forever behind the final standings.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setTimeout(() => setDone(true), durationMs);
    return () => clearTimeout(id);
  }, [durationMs, prefersReducedMotion]);

  if (prefersReducedMotion || done) return null;

  return (
    <FireworksCanvas
      options={{
        intensity,
        explosion,
        particles,
        hue,
        // No audio on a score screen.
        sound: { enabled: false },
        // Decorative only — never react to clicks.
        mouse: { click: false, move: false, max: 0 },
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50,
        background: "transparent",
      }}
    />
  );
}
