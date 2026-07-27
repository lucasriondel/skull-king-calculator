import type { CSSProperties } from "react";

/**
 * Per-player identity colors.
 *
 * Each player gets a hue from this palette, keyed by their index in the game's
 * player list — never by their position in a sorted view (scoreboard, podium),
 * which changes from round to round. Anything that renders a sorted list has to
 * carry the original index along; see `withPlayerColorIndex`.
 *
 * The palette is six hue-spaced colors at matched chroma. Games are capped at
 * eight players, so 7 and 8 wrap around to violet/sky — the two most distinct
 * from their neighbours in the list.
 *
 * Colors are stored as raw HSL channels (`H S% L%`) so they can be dropped into
 * `hsl(var(--player-color) / <alpha>)` and used at several opacities: a tint on
 * the card, a stronger ring, an opaque name. Light and dark need different
 * lightness — a 52% violet that reads well on white is muddy on near-black —
 * so each entry ships both, and the CSS in `globals.css` picks per theme.
 */
export const PLAYER_COLORS = [
  { name: "violet", light: "262 72% 52%", dark: "262 85% 72%" },
  { name: "sky", light: "199 89% 45%", dark: "199 90% 62%" },
  { name: "emerald", light: "160 72% 38%", dark: "160 65% 55%" },
  { name: "orange", light: "25 92% 52%", dark: "25 95% 62%" },
  { name: "pink", light: "340 78% 52%", dark: "340 85% 68%" },
  { name: "amber", light: "47 92% 45%", dark: "47 95% 60%" },
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export function playerColor(playerIndex: number): PlayerColor {
  // Negative or non-integer indices would produce `undefined` and take every
  // consumer down with it, so normalise before wrapping.
  const safeIndex = Number.isFinite(playerIndex)
    ? Math.abs(Math.trunc(playerIndex))
    : 0;
  return PLAYER_COLORS[safeIndex % PLAYER_COLORS.length];
}

/**
 * Inline style exposing a player's color to the CSS in `globals.css`.
 *
 * Both themes' channels are published; the `.player-tinted` rules read
 * `--player-color-light` by default and `--player-color-dark` under `.dark`.
 * Doing the switch in CSS rather than JS keeps the color correct when the theme
 * changes without a re-render.
 */
export function playerColorVars(playerIndex: number): CSSProperties {
  const color = playerColor(playerIndex);
  return {
    "--player-color-light": color.light,
    "--player-color-dark": color.dark,
  } as CSSProperties;
}

/**
 * Tag a list of players with their original index before it gets sorted.
 *
 * Scoreboards and the podium sort by score, which detaches a player's position
 * from their color key. Call this on the unsorted list, then sort the result.
 */
export function withPlayerColorIndex<T>(
  players: T[]
): Array<T & { colorIndex: number }> {
  return players.map((player, index) => ({ ...player, colorIndex: index }));
}
