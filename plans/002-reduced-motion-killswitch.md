# 002 — Add a reduced-motion killswitch for the shadcn/Radix layer

- **Status**: TODO
- **Commit**: e97c72d
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`src/globals.css`), ~1 CSS block added

## Problem

The app's *own* animations are correctly reduced-motion aware — every custom
keyframe is gated behind `motion-safe:` with a `motion-reduce:animate-fade-in`
fallback (see `tailwind.config.ts` `fade-in`/`tab-in`/`score-in`, and usages in
`components/ui/tabs.tsx:47` and `components/game/PlayerCard.tsx:134`).

But the shadcn components sit on top of the `tailwindcss-animate` plugin, which
ships **no `prefers-reduced-motion` handling at all**, and there is **no global
killswitch** in `src/globals.css` either (grep for `prefers-reduced-motion`
returns nothing). So every Radix overlay still zoom-scales and slides even when
the user has asked the OS to reduce motion:

```tsx
/* components/ui/dropdown-menu.tsx:50 — current (representative) */
"... data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ..."
```

Same pattern in:
- `components/ui/popover.tsx:22`
- `components/ui/dialog.tsx:24` (overlay) and `:41` (content)
- `components/ui/select.tsx:78`
- `components/ui/tooltip.tsx:22`
- `components/ui/dropdown-menu.tsx:50` and `:68` (submenu)

For a user with vestibular sensitivity, the treasure-share dropdown, the bonus-
details popover, and any dialog all still translate and scale on open. This is
the one motion layer in the app that ignores the setting.

## Target

A single global rule in `src/globals.css` that, under reduced motion, strips the
**movement and scale** from the `tailwindcss-animate` enter/exit animations while
**keeping the opacity fade** (per AUDIT.md §6: reduced motion means gentler, not
zero — keep the fade that aids comprehension, drop the position/scale change).

`tailwindcss-animate` builds its motion from CSS custom properties
(`--tw-enter-translate-x/y`, `--tw-enter-scale`, `--tw-enter-rotate`, and the
`--tw-exit-*` equivalents). Neutralizing those to their no-op values disables
slide/zoom/rotate for both `animate-in` and `animate-out` in one place, leaving
`--tw-enter-opacity` / `--tw-exit-opacity` untouched so the fade survives:

```css
/* target — append to src/globals.css */
@media (prefers-reduced-motion: reduce) {
  /* The Radix/shadcn overlays animate via tailwindcss-animate, which has no
     reduced-motion handling of its own. Strip movement + scale + rotate but
     keep the opacity fade (which aids comprehension). Covers every
     animate-in / animate-out element: dropdowns, popovers, selects, dialogs,
     tooltips. */
  .animate-in,
  .animate-out {
    --tw-enter-translate-x: 0 !important;
    --tw-enter-translate-y: 0 !important;
    --tw-enter-scale: 1 !important;
    --tw-enter-rotate: 0 !important;
    --tw-exit-translate-x: 0 !important;
    --tw-exit-translate-y: 0 !important;
    --tw-exit-scale: 1 !important;
    --tw-exit-rotate: 0 !important;
  }
}
```

The `!important` is required because the `slide-in-from-*` / `zoom-in-*` /
`fade-in-*` utilities set these same variables via inline-equivalent utility
specificity; without it the utility wins. Opacity variables are deliberately
left out so a plain fade still plays.

## Repo conventions to follow

- Global, non-component CSS lives in `src/globals.css` inside `@layer base`
  blocks or as bare top-level rules (see the existing `html, body { overscroll-
  behavior-y: none; }` at the top and the `@layer base` theme-variable blocks).
  A media query that overrides utility variables must sit **outside** `@layer
  base` (bare, at the end of the file) so it is not demoted below the utilities
  layer in the cascade.
- The app already treats reduced motion as "fade, don't move" — its own
  `motion-reduce:animate-fade-in` fallbacks (`tabs.tsx:47`, `PlayerCard.tsx:134`)
  keep opacity and drop transforms. This rule extends that exact policy to the
  library layer.

## Steps

1. Open `src/globals.css`.
2. Append the `@media (prefers-reduced-motion: reduce) { ... }` block from the
   Target section to the **end of the file**, after the final `@layer base`
   block. Do not nest it inside `@layer base`.

## Boundaries

- Do NOT edit any file under `components/ui/` — the whole point is a single
  global rule instead of touching seven component class strings.
- Do NOT remove or alter the existing `overscroll-behavior-y` rule or any theme
  variables.
- Do NOT add `prefers-reduced-motion` handling that sets `animation: none` on
  `*` — that would also kill the app's own gated `motion-safe:` animations'
  fade fallback and any opacity feedback. Neutralize the transform variables
  only, as specified.
- Do NOT add new dependencies.
- If `src/globals.css` already contains a `prefers-reduced-motion` block (drift
  since commit e97c72d), STOP and report — do not add a second, possibly
  conflicting one.

## Verification

- **Mechanical**:
  - `bun run build` → CSS compiles, no PostCSS/Tailwind errors.
  - `bun run typecheck` → passes (no TS touched).
- **Feel check**: run `bun run dev`. In DevTools → Rendering, enable **Emulate
  prefers-reduced-motion: reduce**, then:
  - Open the treasure-share dropdown (Tricks tab → 💰 toggle): it should appear
    with a plain opacity fade, **no** slide-from-top and **no** zoom.
  - Open the bonus-details popover (Details tab → a bonus points badge): same —
    fade only, no scale/slide.
  - Open any dialog/alert-dialog if reachable: overlay + content fade in with no
    zoom or slide.
  - Now **disable** the emulation and reopen the same dropdown — the normal
    zoom+slide returns (confirms the rule is correctly scoped to the media query
    and didn't disable motion globally).
  - Confirm the app's own gated animations are unaffected: with reduced motion
    on, switching tabs still shows the `fade-in` fallback (not a hard cut and not
    the `tab-in` slide).
- **Done when**: under reduced motion, all Radix overlays fade without moving or
  scaling, and with reduced motion off everything animates as before.
