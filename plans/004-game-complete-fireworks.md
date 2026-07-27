# 004 — Fireworks celebration on the game-complete screen

- **Status**: TODO
- **Commit**: e97c72d
- **Severity**: LOW (delight)
- **Category**: Missed opportunity
- **Estimated scope**: 1 new file (`components/game/Fireworks.tsx`), 1 keyframe
  block in `tailwind.config.ts`, 2 lines in `components/game/GameComplete.tsx`

## Problem

The game-complete screen (`components/game/GameComplete.tsx`) is the single
biggest emotional beat in the app — a game just ended, there's a winner. Right
now it shows a static trophy and podium. It's the textbook rare, high-emotion
moment (AUDIT.md §1/§8) that is *allowed* real delight and currently spends none
of it. A short burst of fireworks behind the trophy card celebrates the win
without touching any interaction.

Because Hard Rule "no new dependencies" applies, this is built as a **self-
contained CSS/DOM component** — no confetti/particle library — animating
`transform` and `opacity` only (AUDIT.md §5), fired once on mount, gated behind
`motion-safe:` so reduced-motion users see nothing move.

## Target

A new presentational component `components/game/Fireworks.tsx` that renders a
fixed-position, `pointer-events-none` overlay of a few firework "bursts". Each
burst is a cluster of small particles that shoot outward and fade — pure CSS
keyframes driven by per-particle CSS custom properties for direction/distance,
so no JS animation loop runs.

### Keyframes (add to `tailwind.config.ts` → `theme.extend.keyframes`)

```ts
/* target — tailwind.config.ts, inside theme.extend.keyframes */
'firework-particle': {
  '0%':   { opacity: '1', transform: 'translate(0, 0) scale(1)' },
  '100%': { opacity: '0', transform: 'translate(var(--fx), var(--fy)) scale(0.4)' },
},
```

And the shorthand (add to `theme.extend.animation`):

```ts
/* target — tailwind.config.ts, inside theme.extend.animation */
// Longer than UI motion on purpose: this is a rare celebration, not UI (AUDIT §1/§2).
'firework-particle': 'firework-particle 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
```

Notes:
- `--fx` / `--fy` are the per-particle end offsets, set inline per particle
  (computed once at render — see component). Movement is a single `translate()`
  so it's GPU-friendly; no `top`/`left`.
- `900ms` and a soft ease-out is fine here — celebrations are explicitly exempt
  from the sub-300ms UI budget (AUDIT.md §2 "Marketing / explanatory can be
  longer"; a win celebration is the same class). **This duration lives on a
  keyframe named `firework-*`, which the feel-test must be allowed to ignore —
  see Boundaries.**
- `scale(0.4)` end (never `scale(0)`) so particles shrink but don't pop out of
  existence (AUDIT.md §3).

### Component (`components/game/Fireworks.tsx`)

Self-contained, deterministic-per-mount, no external deps:

```tsx
/* target — components/game/Fireworks.tsx (new file) */
// A one-shot, purely decorative fireworks burst for the game-complete screen.
// Renders a fixed, pointer-events-none overlay; each particle is a CSS-animated
// dot that flies outward and fades. No animation library, no rAF loop — the
// motion is entirely in the `firework-particle` keyframe, parameterized by the
// per-particle `--fx`/`--fy`/`--delay` custom properties set here.
//
// Gated behind `motion-safe:`: under reduced motion nothing renders/moves.

const BURSTS = [
  { left: "20%", top: "30%", hue: 45, delay: 0 },
  { left: "72%", top: "24%", hue: 210, delay: 250 },
  { left: "48%", top: "40%", hue: 145, delay: 500 },
];
const PARTICLES_PER_BURST = 12;
const RADIUS = 90; // px each particle travels from its burst center

export function Fireworks() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
    >
      {BURSTS.map((burst, b) => (
        <div
          key={b}
          className="absolute"
          style={{ left: burst.left, top: burst.top }}
        >
          {Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
            const angle = (i / PARTICLES_PER_BURST) * 2 * Math.PI;
            const fx = Math.cos(angle) * RADIUS;
            const fy = Math.sin(angle) * RADIUS;
            return (
              <span
                key={i}
                className="absolute block h-1.5 w-1.5 rounded-full motion-safe:animate-firework-particle"
                style={{
                  backgroundColor: `hsl(${burst.hue} 90% 60%)`,
                  // custom props consumed by the keyframe
                  ["--fx" as string]: `${fx}px`,
                  ["--fy" as string]: `${fy}px`,
                  animationDelay: `${burst.delay}ms`,
                  opacity: 0, // held until motion-safe animation runs; forwards fill keeps final state
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

Angles are derived deterministically from the particle index (no `Math.random()`
at render, so no hydration/StrictMode double-render mismatch and no lint noise).
`opacity: 0` inline + the keyframe's `0% { opacity: 1 }` with `forwards` fill
means: under `motion-safe` the animation drives opacity 1→0; under
`motion-reduce` the wrapper is `hidden`, so the `opacity: 0` particles never
show. Both paths end invisible, which is correct — fireworks are transient.

### Wire into the screen (`components/game/GameComplete.tsx`)

The screen's root is `<div className="container ... relative">` at
`GameComplete.tsx:313`. Render `<Fireworks />` as its first child so the overlay
sits behind the card content (`z-0` vs. the card's normal flow). Import at top.

```tsx
/* target — components/game/GameComplete.tsx */
import { Fireworks } from "@/components/game/Fireworks";
// ...
return (
  <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
    <Fireworks />
    <div className="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>
    {/* ...unchanged... */}
```

## Repo conventions to follow

- One component per file, in `components/game/` (peer to `Podium.tsx`,
  `GameComplete.tsx`). Named export, no default. Exemplar: `Podium.tsx`.
- Keyframes + `animation` shorthand live in `tailwind.config.ts` `theme.extend`;
  copy the `score-in` entry's shape.
- Decorative motion is `motion-safe:`-gated with a `motion-reduce` fallback
  (here the fallback is "render nothing", via `motion-reduce:hidden`). Exemplar
  of the gating idiom: `PlayerCard.tsx:134`.
- `transform`/`opacity` only for animated properties (no `top`/`left` animation —
  the `left`/`top` here are static positioning, not animated).

## Steps

1. Create `components/game/Fireworks.tsx` with the component from the Target
   section, verbatim.
2. In `tailwind.config.ts`, add the `firework-particle` keyframe to
   `theme.extend.keyframes` and its shorthand to `theme.extend.animation`.
3. In `components/game/GameComplete.tsx`: add
   `import { Fireworks } from "@/components/game/Fireworks";` at the top with the
   other imports, and render `<Fireworks />` as the first child of the root
   `relative` container `div` (line 313).

## Boundaries

- Do NOT add a confetti/particle npm package — this is deliberately dependency-
  free.
- Do NOT use `Math.random()` in the component (breaks deterministic render /
  React StrictMode double-invoke and adds lint noise). Angles come from the
  index.
- Do NOT put the overlay above the interactive card content — it must be
  `pointer-events-none` and `z-0` so buttons (New Game) stay clickable.
- Do NOT animate `top`/`left`/`width`/`height` — only the keyframe's
  `transform`/`opacity`.
- **Feel-test interaction**: `components/game/issue-9-feel.test.ts` asserts every
  `<n>ms` duration in `tailwind.config.ts` is `< 300`. The `900ms` firework
  duration will break that test as written. Before adding the keyframe, read that
  test; the correct resolution is to **scope the test's duration scan to exclude
  the `firework-*` animation** (it is a celebration, explicitly exempt from the
  UI budget per AUDIT.md §2), e.g. filter out the line containing `firework`
  before the `max < 300` assertion, and add a one-line comment there explaining
  why. If you cannot cleanly exclude it, STOP and report rather than lowering the
  firework duration below 300ms (which would ruin the effect) or deleting the
  test.
- If `GameComplete.tsx:313` no longer has the `relative` container (drift since
  e97c72d), STOP and report.

## Verification

- **Mechanical**:
  - `bun run typecheck` → passes (note the `["--fx" as string]` cast is there to
    satisfy TS for custom-property style keys).
  - `bun test` → passes, including the adjusted `issue-9-feel.test.ts`.
  - `bun run build` → Tailwind compiles the new keyframe.
- **Feel check**: run `bun run dev`, finish a game to reach the complete screen:
  - Three fireworks bursts fire behind the trophy card, staggered ~250ms apart,
    particles flying outward and fading over ~0.9s, then gone (no residual dots).
  - The "New Game" button and language switcher remain fully clickable during and
    after the burst (overlay is pointer-events-none, z-0).
  - In DevTools → Animations at 10% playback: particles travel outward via
    `translate` and shrink to 0.4 (never to 0), fading as they go.
  - In DevTools → Rendering, enable **prefers-reduced-motion: reduce**, reload the
    completed game: **no** fireworks render at all (wrapper `hidden`), and the
    rest of the screen is unchanged.
  - Confirm no console errors and no layout shift of the card when the overlay
    mounts.
- **Done when**: a dependency-free fireworks burst plays once on the game-complete
  screen using transform/opacity only, stays behind and non-blocking to the UI,
  and renders nothing under reduced motion.
