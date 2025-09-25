import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { Minus, Plus } from "lucide-react";
import { BonusType } from "./BonusControls";

interface Player {
  name: string;
  score: number;
}

interface TreasureControlProps {
  playerIndex: number;
  players: Player[];
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export function TreasureControl({
  playerIndex,
  players,
  bonuses,
  setBonuses,
  isActive,
  onToggle,
}: TreasureControlProps) {
  const adjustTreasure = (delta: number) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || {
        greenBonus: false,
        yellowBonus: false,
        purpleBonus: false,
        darkBonus: false,
        treasure: 0,
        mermaid: 0,
        pirate: 0,
        skullKing: false,
      };

      const currentValue = playerBonuses.treasure || 0;
      const newValue = Math.min(2, Math.max(0, currentValue + delta));

      return {
        ...prev,
        [playerIndex]: {
          ...playerBonuses,
          treasure: newValue,
        },
      };
    });
  };

  const incrementTreasureForBothPlayers = (targetPlayerIndex: number) => {
    setBonuses((prev) => {
      const result = { ...prev };

      // Increment treasure for current player
      const currentPlayerBonuses = prev[playerIndex] || {
        greenBonus: false,
        yellowBonus: false,
        purpleBonus: false,
        darkBonus: false,
        treasure: 0,
        mermaid: 0,
        pirate: 0,
        skullKing: false,
      };

      result[playerIndex] = {
        ...currentPlayerBonuses,
        treasure: Math.min(2, (currentPlayerBonuses.treasure || 0) + 1),
      };

      // Increment treasure for target player
      const targetPlayerBonuses = prev[targetPlayerIndex] || {
        greenBonus: false,
        yellowBonus: false,
        purpleBonus: false,
        darkBonus: false,
        treasure: 0,
        mermaid: 0,
        pirate: 0,
        skullKing: false,
      };

      result[targetPlayerIndex] = {
        ...targetPlayerBonuses,
        treasure: Math.min(2, (targetPlayerBonuses.treasure || 0) + 1),
      };

      return result;
    });
  };

  // Get other players (excluding current player)
  const otherPlayers = players.filter((_, index) => index !== playerIndex);

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToggleGroupItem value="treasure" onClick={() => onToggle(!isActive)}>
            💰 {bonuses[playerIndex]?.treasure || 0}
          </ToggleGroupItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {otherPlayers.map((player, index) => {
            const actualPlayerIndex = players.findIndex(
              (p) => p.name === player.name
            );
            return (
              <DropdownMenuItem
                key={player.name}
                onClick={() =>
                  incrementTreasureForBothPlayers(actualPlayerIndex)
                }
              >
                Share with {player.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {isActive && (
        <div className="flex flex-col gap-0.5">
          <Button
            size="icon"
            variant="outline"
            className="h-5 w-5"
            onClick={() => adjustTreasure(1)}
            disabled={bonuses[playerIndex]?.treasure >= 2}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-5 w-5"
            onClick={() => adjustTreasure(-1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
