import { playerColor, playerColorVars } from "@/lib/player-colors";
import { cn } from "@/lib/utils";

export interface PlayerColorDotProps {
  /** Index of the player in the game's player list. */
  colorIndex: number;
  className?: string;
}

/**
 * The solid swatch of a player's identity color.
 *
 * Used on the setup screen so players see which color is theirs before the
 * first round, and the tinted cards later need no explanation.
 */
export function PlayerColorDot({ colorIndex, className }: PlayerColorDotProps) {
  return (
    <span
      aria-hidden
      title={playerColor(colorIndex).name}
      className={cn(
        "player-tinted player-tinted-dot h-3 w-3 shrink-0 rounded-full",
        className
      )}
      style={playerColorVars(colorIndex)}
    />
  );
}
