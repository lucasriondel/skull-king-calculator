import type { CSSProperties } from "react";

// Issue #15: one-shot, dependency-free fireworks behind the trophy card.
//
// Three bursts fire once on mount, staggered ~250ms apart; each burst throws a
// ring of small particles outward that fade and shrink to scale 0.4 over the
// `firework` animation (~0.9s) then hold at opacity 0 (fill-mode forwards → no
// residual dots). Geometry is fully deterministic (trig on the particle index,
// never a random seed). The overlay is fixed / pointer-events-none / z-0 so the
// card, New Game button and language switcher stay clickable and on top.
//
// Everything is gated behind `motion-safe:`: the overlay is `hidden` by default
// and only `motion-safe:block`, and particles only carry the animation under
// `motion-safe:`, so reduced-motion users see nothing move at all.

const PARTICLE_COUNT = 12;
const RADIUS = 90; // px each particle travels outward from its burst center
const STAGGER_MS = 250; // gap between successive bursts, so the pops land in sequence

// Festive palette; picked deterministically per particle, no randomness.
const COLORS = [
  "#fbbf24", // amber
  "#f472b6", // pink
  "#60a5fa", // blue
  "#34d399", // emerald
  "#f87171", // red
  "#a78bfa", // violet
];

// Burst centers as viewport percentages, behind the trophy card. They fire in
// order, STAGGER_MS apart.
const BURSTS = [
  { cx: 50, cy: 26 },
  { cx: 38, cy: 34 },
  { cx: 62, cy: 32 },
];

export function Fireworks() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none hidden motion-safe:block overflow-hidden"
    >
      {BURSTS.map((burst, burstIndex) => (
        <div
          key={`${burst.cx}-${burst.cy}`}
          className="absolute"
          style={{ left: `${burst.cx}%`, top: `${burst.cy}%` }}
        >
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
            const x = Math.cos(angle) * RADIUS;
            const y = Math.sin(angle) * RADIUS;
            return (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full opacity-0 motion-safe:animate-firework"
                style={
                  {
                    backgroundColor: COLORS[(burstIndex + i) % COLORS.length],
                    "--fw-x": `${x}px`,
                    "--fw-y": `${y}px`,
                    animationDelay: `${burstIndex * STAGGER_MS}ms`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
