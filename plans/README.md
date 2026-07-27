# Animation improvement plans

Produced by `improve-animations` against commit `e97c72d`. Each plan is fully
self-contained — exact files, values, and feel-checks — and can be executed by
any agent with no further context.

**Baseline note.** This app is already in good shape: issue #9 added press-scale
feedback, strong custom ease-out curves (`cubic-bezier(0.22, 1, 0.36, 1)`),
sub-300ms durations, `motion-safe:`/`motion-reduce:` gating, and no
`transition: all`. These plans close the remaining gaps and add delight to the
one high-emotion screen.

## Plans

| # | Title | Severity | Files | Status |
|---|---|---|---|---|
| [001](./001-bonus-toggle-press-feedback.md) | Press-scale feedback on bonus toggles | HIGH | `components/ui/toggle.tsx` | TODO |
| [002](./002-reduced-motion-killswitch.md) | Reduced-motion killswitch for shadcn/Radix layer | MEDIUM | `src/globals.css` | TODO |
| [003](./003-podium-entrance.md) | Podium bars rise in (staggered) | LOW | `tailwind.config.ts`, `components/game/Podium.tsx` | TODO |
| [004](./004-game-complete-fireworks.md) | Fireworks on the game-complete screen | LOW (delight) | new `components/game/Fireworks.tsx`, `tailwind.config.ts`, `components/game/GameComplete.tsx` | TODO |

## Recommended execution order

1. **001** — highest leverage, one-line change, zero risk. Fixes the dead-feeling
   bonus toggles (the most-tapped surface in the game).
2. **002** — broad accessibility win, one CSS block, independent of everything.
3. **003** — delight on the podium; touches `tailwind.config.ts`.
4. **004** — fireworks; also touches `tailwind.config.ts`.

## Dependencies & conflicts

- **003 and 004 both edit `tailwind.config.ts`** (adding keyframes + animation
  entries). No logical conflict — they add sibling entries — but if executed by
  separate agents in parallel worktrees they will textually collide on merge.
  **Run 003 and 004 sequentially, or have one agent do both**, so the
  `theme.extend.keyframes` / `theme.extend.animation` edits stack cleanly.
- **004 also edits the feel-test** (`components/game/issue-9-feel.test.ts`) to
  exempt the `firework-*` duration from the sub-300ms scan. 003 relies on that
  same test staying green with its 220ms value (which it does). If both run,
  apply 003 first (stays under 300ms, no test change) then 004 (adds the
  exemption) to keep each step's verification clean.
- **001 and 002** are fully independent of each other and of 003/004 — any order.

## Not turned into plans (vetted out)

- **Base `CardButtonGrid.Cell` press feedback** — considered, rejected. The only
  interactive Cell (via `onClick`) is the number selector, which *already* scales
  through its own CVA variant; the bonus toggles are non-interactive at the Cell
  level (Radix handles the click on the item), so a Cell-level scale would be a
  no-op. The real fix lives in plan 001 on `toggle.tsx` instead.
- **Round-advance transition** and **score-badge re-pulse on value change** —
  noted as low-confidence missed opportunities during the audit; not planned
  without a device feel-check confirming they improve rather than distract.
