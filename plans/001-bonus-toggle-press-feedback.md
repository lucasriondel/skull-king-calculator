# 001 — Add press-scale feedback to bonus toggles

- **Status**: TODO
- **Commit**: e97c72d
- **Severity**: HIGH
- **Category**: Physicality & origin / Cohesion
- **Estimated scope**: 1 file (`components/ui/toggle.tsx`), ~1 line changed

## Problem

The bonus controls are the most-tapped surface in the game — every round, each
player taps the +10 color bonuses (green/yellow/purple/dark), the special-card
toggles (treasure/mermaid/pirate), and the Skull King toggle. These are all
rendered as Radix `ToggleGroupItem`, which pull their classes from
`toggleVariants` in `components/ui/toggle.tsx`.

That base class has **color transitions only and no press feedback** — no scale
on `:active`, `transform` is not in the transition list:

```tsx
/* components/ui/toggle.tsx:10 — current */
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2",
  ...
```

Meanwhile the number-selector cells directly beside them **do** scale on press
(`components/game/NumberSelector.tsx:6`, `active:scale-[0.96]`) and the shared
`Button` scales too (`components/ui/button.tsx:7`, `active:scale-[0.97]`). The
result: on a bid/tricks card, the number pad depresses under your thumb but the
bonus toggles right below it feel dead. On touch, where there is no hover, the
press-scale is the *only* immediate confirmation a tap registered.

Note on why this is the right file: the color-toggle grid cells in
`components/game/BonusControls.tsx:392–438` wrap a `ToggleGroupItem` but pass
**no `onClick` to the `CardButtonGrid.Cell`** (Radix handles the click on the
item). So `card-button-grid.tsx`'s `isInteractive` flag is `false` for those
cells and any scale added there would never fire. The press feedback must live
on the toggle item itself — i.e. here.

## Target

Add press-scale to the toggle base class, matching the existing convention
exactly (same scale value family, same reduced-motion guard, `transform` added
to the transitioned properties so the scale eases):

```tsx
/* target — components/ui/toggle.tsx:10 */
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-[color,background-color,transform] active:scale-[0.96] motion-reduce:active:scale-100 hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2",
  ...
```

The only changes vs. current: `transition-colors` → `transition-[color,background-color,transform]`,
and `active:scale-[0.96] motion-reduce:active:scale-100` inserted right after it.
`0.96` matches the number-selector cells the toggles sit beside (not the
`0.97` used by the taller `Button`), so the two grids depress by the same amount.

## Repo conventions to follow

- Press feedback is expressed as Tailwind utilities on the component's class
  string, always paired with a reduced-motion neutralizer. Exemplars:
  - `components/game/NumberSelector.tsx:6` — `active:scale-[0.96] motion-reduce:active:scale-100`
  - `components/ui/button.tsx:7` — `active:scale-[0.97] motion-reduce:active:scale-100`
- Transitions name explicit properties, never `transition-all` (enforced by the
  test in `components/game/issue-9-feel.test.ts:51`). Keep `transform` in the
  bracket list so the scale animates rather than snapping.
- No duration is specified on these utility-based press scales anywhere in the
  repo — they inherit Tailwind's default `transition-duration` (150ms), which is
  within the 100–160ms button-press budget. Do not add an explicit duration.

## Steps

1. Open `components/ui/toggle.tsx`.
2. In the `cva(...)` base string on line 10, replace `transition-colors` with
   `transition-[color,background-color,transform] active:scale-[0.96] motion-reduce:active:scale-100`.
   Change nothing else in the file — the `variant`/`size` maps and the
   `Toggle`/`toggleVariants` exports stay exactly as they are.

## Boundaries

- Do NOT touch `components/ui/card-button-grid.tsx` — the fix does not belong
  there (see Problem: those cells are non-interactive at the Cell level).
- Do NOT add `active:scale` to `components/ui/toggle-group.tsx` — items inherit
  from `toggleVariants`, so one edit covers `ToggleGroupItem` too.
- Do NOT change markup, structure, the `variant`/`size` options, or add a
  duration class. Motion utilities only.
- Do NOT add new dependencies.
- If line 10 no longer contains `transition-colors` (drift since commit e97c72d),
  STOP and report instead of guessing where to insert the scale.

## Verification

- **Mechanical**:
  - `bun run typecheck` → passes (no type surface touched).
  - `bun test` → passes; in particular `components/game/issue-9-feel.test.ts`
    (no `transition-all` introduced) stays green.
- **Feel check**: run `bun run dev`, start a game, reach the Tricks tab so the
  bonus row is visible, then:
  - Press-and-hold a color bonus (+10) toggle — it should visibly shrink to ~96%
    while held and spring back on release, matching the number pad above it.
  - Tap the treasure/mermaid/pirate/skull-king toggles — same depress.
  - Confirm the depress amount looks identical to the number-selector cells (both
    at 0.96) — no size mismatch between the two grids.
  - In DevTools → Rendering, enable **Emulate prefers-reduced-motion: reduce**,
    then press a toggle: it must NOT scale (only the background/color changes).
- **Done when**: every bonus `ToggleGroupItem` depresses on press with the same
  feel as the number cells, and the scale is suppressed under reduced motion.
