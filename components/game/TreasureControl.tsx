import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  BonusType,
  addTreasureGroup,
  findPlayerTreasureGroups,
  findTreasurePartners,
  removeTreasureGroup,
} from "./BonusControls";

interface Player {
  name: string;
  score: number;
}

interface TreasureControlProps {
  playerIndex: number;
  players: Player[];
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
}

export function TreasureControl({
  playerIndex,
  players,
  bonuses,
  setBonuses,
}: TreasureControlProps) {
  const createTreasureGroup = (targetPlayerIndex: number) => {
    setBonuses((prev) => {
      return addTreasureGroup(prev, [playerIndex, targetPlayerIndex], 1);
    });
  };

  const removeGroup = (groupId: string) => {
    setBonuses((prev) => removeTreasureGroup(prev, groupId));
  };

  const otherPlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== playerIndex);

  const treasureGroups = findPlayerTreasureGroups(playerIndex, bonuses);
  const treasurePartners = findTreasurePartners(playerIndex, bonuses);
  const hasPartners = treasurePartners.length > 0;
  const treasureCount = bonuses[playerIndex]?.treasure || 0;
  const atLimit = treasureCount >= 2;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToggleGroupItem
          value="treasure"
          className={cn(
            "rounded-none h-10 w-full min-w-0 px-0 border-0 data-[state=on]:bg-accent/60",
            hasPartners && "ring-2 ring-inset ring-blue-400"
          )}
        >
          💰 {treasureCount}
          {hasPartners && <span className="ml-1 text-xs">👥</span>}
        </ToggleGroupItem>
      </DropdownMenuTrigger>
        <DropdownMenuContent>
          {treasureGroups.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Currently sharing with:
              </div>
              {treasureGroups.map((group) => {
                const partnerIndexes = group.playerIndexes.filter(
                  (i) => i !== playerIndex
                );
                const label =
                  partnerIndexes.length === 0
                    ? "Self only"
                    : partnerIndexes
                        .map((i) => players[i]?.name)
                        .filter(Boolean)
                        .join(", ");
                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-blue-600"
                  >
                    <span>
                      {partnerIndexes.length > 0 ? "👥 " : ""}
                      {label}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeGroup(group.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
              <div className="my-1 h-px bg-border" />
            </>
          )}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Share with:
          </div>
          {otherPlayers.map(({ player, index: actualPlayerIndex }) => (
            <DropdownMenuItem
              key={actualPlayerIndex}
              onClick={() => createTreasureGroup(actualPlayerIndex)}
              disabled={atLimit}
            >
              {player.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
