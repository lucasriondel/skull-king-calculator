# 003 — Animate the game-complete / scores podium bars rising in

- **Status**: TODO
- **Commit**: e97c72d
- **Severity**: LOW (delight)
- **Category**: Missed opportunity / Physicality
- **Estimated scope**: 2 files (`tailwind.config.ts`, `components/game/Podium.tsx`), ~15 lines

## Problem

The podium is the payoff of a whole game — three ranked bars with a trophy on
first place — and it renders with **zero entrance**. The bars are just present on
mount:

```tsx
/* components/game/Podium.tsx:426 — current */
<div
  className={`w-full ${height} ${colors.bg} rounded-t-lg flex items-center justify-center border-2 ${colors.border} border-b-0`}
>
  <span className={`text-2xl font-black ${colors.text}`}>{rankIdx + 1}</span>
</div>
```

`Podium` is shown in two places:
- `components/game/GameComplete.tsx:326` — the end-of-game screen (rare, once per
  game, the single highest-emotion moment in the app).
- `components/game/ScoresTab.tsx:469` — the live scores tab (seen more often).

Per AUDIT.md §1, rare high-emotion moments are exactly where the delight budget
belongs, and §8 calls out podium/celebration seams rendered "with none of the
delight budget they're allowed." A brief staggered rise makes the ranking feel
earned instead of teleported.

## Target

Add a `podium-rise` keyframe: bars start pushed down by their own height and
transparent, then settle. Movement expressed as a **percentage translate**
(AUDIT.md §8 — `translateY(100%)` = the element's own height, no hardcoded px),
using the repo's existing strong ease-out curve, well under 300ms, staggered by
rank so 1st place lands last (a tiny crescendo). Reduced-motion falls back to the
existing `fade-in` (opacity only, no movement).

Add to `tailwind.config.ts` `keyframes` and `animation` (alongside the existing
`score-in` etc.):

```ts
/* target — tailwind.config.ts, inside theme.extend.keyframes */
'podium-rise': {
  from: { opacity: '0', transform: 'translateY(40%)' },
  to:   { opacity: '1', transform: 'translateY(0)' },
},
```

```ts
/* target — tailwind.config.ts, inside theme.extend.animation */
// Same strong ease-out + sub-300ms budget as the other enter animations.
'podium-rise': 'podium-rise 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
```

Notes on the values:
- `220ms` sits in the modal/celebration range and stays under the 300ms UI
  ceiling.
- `cubic-bezier(0.22, 1, 0.36, 1)` is the **exact** curve already used by
  `fade-in`/`tab-in`/`score-in` in this file — reuse it, do not introduce a new
  one.
- `both` fill-mode holds the `from` state before the delay elapses so a
  staggered bar doesn't flash at full position first.
- `translateY(40%)` (not `100%`) because the bars have different heights
  (`h-28`/`h-20`/`h-14`) and a full-height offset would look uneven across ranks;
  40% of each bar's own height reads as a consistent, subtle rise.

Apply it in `Podium.tsx` on the bar `div`, `motion-safe:` gated with a
`motion-reduce:animate-fade-in` fallback, and stagger via an inline
`animationDelay` keyed to display position (60ms per step — within the 30–80ms
stagger window from AUDIT.md §7):

```tsx
/* target — components/game/Podium.tsx, the bar div at :426 */
<div
  className={`w-full ${height} ${colors.bg} rounded-t-lg flex items-center justify-center border-2 ${colors.border} border-b-0 motion-safe:animate-podium-rise motion-reduce:animate-fade-in`}
  style={{ animationDelay: `${displayIdx * 60}ms` }}
>
```

`displayIdx` is the map index already in scope in `Podium.tsx:404`
(`displayOrder.map((player, displayIdx) => ...)`). Using it means the bars
animate left-to-right in display order; that's the desired reading direction.

## Repo conventions to follow

- Keyframes + their `animation` shorthand live in `tailwind.config.ts` under
  `theme.extend`; `score-in` (`tailwind.config.ts`) is the exemplar — copy its
  shape and its `cubic-bezier(0.22, 1, 0.36, 1)` curve verbatim.
- Enter animations are applied as `motion-safe:animate-<name>` with a paired
  `motion-reduce:animate-fade-in`. Exemplar: `components/game/PlayerCard.tsx:134`.
- Sub-300ms only — enforced by `components/game/issue-9-feel.test.ts` (it scans
  every `<n>ms` in the tailwind config and asserts `max < 300`). `220ms` keeps
  that green. **Do not exceed 299ms** in the config.

## Steps

1. In `tailwind.config.ts`, add the `podium-rise` entry to
   `theme.extend.keyframes` (after `score-in`).
2. In the same file, add the `'podium-rise': 'podium-rise 220ms cubic-bezier(0.22, 1, 0.36, 1) both'`
   entry to `theme.extend.animation` (after `score-in`).
3. In `components/game/Podium.tsx`, on the bar `div` (currently at line 426), add
   `motion-safe:animate-podium-rise motion-reduce:animate-fade-in` to the
   `className` and add `style={{ animationDelay: \`${displayIdx * 60}ms\` }}`.
   Do not restructure the JSX; the `displayIdx` variable is already the map
   callback's index.

## Boundaries

- Do NOT animate the player-name/score block above the bars (`Podium.tsx:415`) —
  bars only, to keep the effect focused.
- Do NOT add a duration ≥ 300ms anywhere in `tailwind.config.ts` (breaks the
  feel-test).
- Do NOT introduce a new easing curve — reuse the existing
  `cubic-bezier(0.22, 1, 0.36, 1)`.
- Do NOT touch `GameComplete.tsx` or `ScoresTab.tsx`; editing `Podium.tsx` covers
  both usages automatically.
- Do NOT add new dependencies.
- If `Podium.tsx` no longer has the `displayOrder.map((player, displayIdx) => ...)`
  structure (drift since e97c72d), STOP and report.

## Verification

- **Mechanical**:
  - `bun run typecheck` → passes.
  - `bun test` → passes, including `components/game/issue-9-feel.test.ts`
    (max config duration still < 300ms).
  - `bun run build` → Tailwind compiles the new keyframe.
- **Feel check**: run `bun run dev`, finish a game (or open the Scores tab
  mid-game):
  - The podium bars rise from slightly below and fade in, 1st/2nd/3rd staggered
    ~60ms apart in display order (left → right).
  - In DevTools → Animations, set playback to 10% and confirm the bars **rise**
    (never drop from above, never appear from `scale(0)`) and each starts held at
    the offset (no flash at final position before its delay).
  - In DevTools → Rendering, enable **prefers-reduced-motion: reduce** and reload
    the completed game: bars **fade only**, no vertical movement, no stagger jank.
  - Sanity-check with 2 players and 1 player (Podium handles `top3.length` of 2
    and 1) — the animation still runs and nothing errors on the shorter podium.
- **Done when**: the podium bars animate in with a subtle staggered rise on the
  game-complete and scores screens, and degrade to a plain fade under reduced
  motion.
