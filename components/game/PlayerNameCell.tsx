import { TableCell } from "@/components/ui/table";
import { playerColorVars } from "@/lib/player-colors";

export interface PlayerNameCellProps {
  name: string;
  /** Index of the player in the game's player list — drives their color. */
  colorIndex: number;
}

/**
 * The player-name cell of a per-round details table, in the player's color.
 *
 * The rows here are unsorted (seat order), so `colorIndex` is just the player's
 * position in the store's list.
 */
export function PlayerNameCell({ name, colorIndex }: PlayerNameCellProps) {
  return (
    <TableCell
      className="player-tinted player-tinted-name font-semibold"
      style={playerColorVars(colorIndex)}
    >
      {name}
    </TableCell>
  );
}
