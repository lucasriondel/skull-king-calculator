import { playerColorVars } from "@/lib/player-colors";
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

export interface ScoreRowProps {
  name: string;
  /** 1-based place shown to the player: 4, 5, … */
  place: number;
  /** Index of the player in the game's player list — drives their color. */
  colorIndex: number;
  /** The score cell. A node rather than a number so callers can animate it. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * One off-podium standings row, tinted with the player's color.
 *
 * Shared by the mid-game scoreboard and the game-complete reveal; the latter
 * wraps it to animate the row in and count its score up.
 */
export function ScoreRow({
  name,
  place,
  colorIndex,
  children,
  className,
  style,
}: ScoreRowProps) {
  return (
    <div
      className={cn(
        "player-tinted player-tinted-surface flex items-center justify-between p-3 rounded-lg bg-accent/50",
        className
      )}
      style={{ ...playerColorVars(colorIndex), ...style }}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-bold w-6 text-center tabular-nums">
          {place}
        </span>
        <span className="player-tinted-name font-semibold">{name}</span>
      </div>
      <span className="font-bold tabular-nums">{children}</span>
    </div>
  );
}
