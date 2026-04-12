import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { TreasureControl } from "./TreasureControl";

export type TreasureGroup = {
  id: string; // unique identifier for the group
  playerIndexes: number[]; // array of player indexes sharing treasure
  treasureCount: number; // number of shared treasures (1 or 2)
};

// Utility functions for managing treasure groups
export const generateTreasureGroupId = () =>
  `treasure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const findPlayerTreasureGroups = (
  playerIndex: number,
  bonuses: Record<number, BonusType>
): TreasureGroup[] => {
  const playerBonuses = bonuses[playerIndex];
  if (!playerBonuses?.treasureGroups) return [];

  return playerBonuses.treasureGroups.filter((group) =>
    group.playerIndexes.includes(playerIndex)
  );
};

export const findTreasurePartners = (
  playerIndex: number,
  bonuses: Record<number, BonusType>
): number[] => {
  const groups = findPlayerTreasureGroups(playerIndex, bonuses);
  const partners = new Set<number>();

  groups.forEach((group) => {
    group.playerIndexes.forEach((index) => {
      if (index !== playerIndex) {
        partners.add(index);
      }
    });
  });

  return Array.from(partners);
};

export const addTreasureGroup = (
  bonuses: Record<number, BonusType>,
  playerIndexes: number[],
  treasureCount: number = 1
): Record<number, BonusType> => {
  const groupId = generateTreasureGroupId();
  const newGroup: TreasureGroup = {
    id: groupId,
    playerIndexes,
    treasureCount,
  };

  const result = { ...bonuses };

  // Add the group to all involved players
  playerIndexes.forEach((playerIndex) => {
    const playerBonuses = result[playerIndex] || {
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
      ...playerBonuses,
      treasure: Math.min(2, (playerBonuses.treasure || 0) + treasureCount),
      treasureGroups: [...(playerBonuses.treasureGroups || []), newGroup],
    };
  });

  return result;
};

export const removeTreasureGroup = (
  bonuses: Record<number, BonusType>,
  groupId: string
): Record<number, BonusType> => {
  const result = { ...bonuses };

  Object.keys(result).forEach((playerIndexStr) => {
    const playerIndex = parseInt(playerIndexStr);
    const playerBonuses = result[playerIndex];

    if (playerBonuses?.treasureGroups) {
      const groupToRemove = playerBonuses.treasureGroups.find(
        (g) => g.id === groupId
      );
      const updatedGroups = playerBonuses.treasureGroups.filter(
        (g) => g.id !== groupId
      );

      result[playerIndex] = {
        ...playerBonuses,
        treasure: Math.max(
          0,
          (playerBonuses.treasure || 0) - (groupToRemove?.treasureCount || 0)
        ),
        treasureGroups: updatedGroups,
      };
    }
  });

  return result;
};

export type BonusType = {
  greenBonus: boolean;
  yellowBonus: boolean;
  purpleBonus: boolean;
  darkBonus: boolean;
  treasure: number;
  mermaid: number;
  pirate: number;
  skullKing: boolean;
  treasureGroups?: TreasureGroup[];
};

interface Player {
  name: string;
  score: number;
}

interface BonusControlsProps {
  playerIndex: number;
  players: Player[];
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  getPlayerWithBonus: (
    color: "green" | "yellow" | "purple" | "dark" | "skullKing"
  ) => number | null;
}

export function BonusControls({
  playerIndex,
  players,
  bonuses,
  setBonuses,
  getPlayerWithBonus,
}: BonusControlsProps) {
  const greenOwner = getPlayerWithBonus("green");
  const yellowOwner = getPlayerWithBonus("yellow");
  const purpleOwner = getPlayerWithBonus("purple");
  const darkOwner = getPlayerWithBonus("dark");
  const skullKingOwner = getPlayerWithBonus("skullKing");

  const showGreen = greenOwner === null || greenOwner === playerIndex;
  const showYellow = yellowOwner === null || yellowOwner === playerIndex;
  const showPurple = purpleOwner === null || purpleOwner === playerIndex;
  const showDark = darkOwner === null || darkOwner === playerIndex;
  const showSkullKing =
    skullKingOwner === null || skullKingOwner === playerIndex;

  const adjustSpecialCard = (
    cardType: "mermaid" | "pirate" | "treasure",
    delta: number
  ) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || {
        greenBonus: false,
        yellowBonus: false,
        purpleBonus: false,
        darkBonus: false,
        mermaid: 0,
        pirate: 0,
        skullKing: false,
      };

      const maxValue =
        cardType === "mermaid" ? 2 : cardType === "treasure" ? 2 : 6;
      const currentValue =
        cardType in playerBonuses ? playerBonuses[cardType] || 0 : 0;
      const newValue = Math.min(maxValue, Math.max(0, currentValue + delta));

      return {
        ...prev,
        [playerIndex]: {
          ...playerBonuses,
          [cardType]: newValue,
        },
      };
    });
  };

  const cellClass =
    "rounded-none h-10 w-full min-w-0 px-0 border-t data-[state=on]:bg-accent/60";
  const row2CellClass = cellClass;

  const handleColorChange = (values: string[]) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || {
        greenBonus: false,
        yellowBonus: false,
        purpleBonus: false,
        darkBonus: false,
        mermaid: 0,
        pirate: 0,
        skullKing: false,
      };

      if (
        values.length <
        Object.values(prev[playerIndex] || {}).filter(Boolean).length
      ) {
        return {
          ...prev,
          [playerIndex]: {
            ...playerBonuses,
            greenBonus: values.includes("green"),
            yellowBonus: values.includes("yellow"),
            purpleBonus: values.includes("purple"),
            darkBonus: values.includes("dark"),
          },
        };
      }

      const newValue = values[values.length - 1] as
        | "green"
        | "yellow"
        | "purple"
        | "dark";
      if (!newValue) return prev;

      const otherPlayerIndex = getPlayerWithBonus(newValue);
      const result = { ...prev };

      if (otherPlayerIndex !== null) {
        result[otherPlayerIndex] = {
          ...result[otherPlayerIndex],
          greenBonus:
            newValue === "green"
              ? false
              : result[otherPlayerIndex].greenBonus,
          yellowBonus:
            newValue === "yellow"
              ? false
              : result[otherPlayerIndex].yellowBonus,
          purpleBonus:
            newValue === "purple"
              ? false
              : result[otherPlayerIndex].purpleBonus,
          darkBonus:
            newValue === "dark"
              ? false
              : result[otherPlayerIndex].darkBonus,
        };
      }

      result[playerIndex] = {
        ...playerBonuses,
        greenBonus: values.includes("green"),
        yellowBonus: values.includes("yellow"),
        purpleBonus: values.includes("purple"),
        darkBonus: values.includes("dark"),
      };

      return result;
    });
  };

  const handleSpecialChange = (values: string[]) => {
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

      const result = { ...prev };
      result[playerIndex] = {
        ...playerBonuses,
        treasure: values.includes("treasure")
          ? playerBonuses.treasure || 1
          : 0,
        mermaid: values.includes("mermaid") ? playerBonuses.mermaid || 1 : 0,
        pirate: values.includes("pirate") ? playerBonuses.pirate || 1 : 0,
        skullKing: values.includes("skullKing"),
      };

      if (values.includes("skullKing")) {
        const otherPlayerIndex = getPlayerWithBonus("skullKing");
        if (otherPlayerIndex !== null && otherPlayerIndex !== playerIndex) {
          result[otherPlayerIndex] = {
            ...result[otherPlayerIndex],
            skullKing: false,
          };
        }
      }

      return result;
    });
  };

  return (
    <div className="grid grid-cols-4 w-full">
      <ToggleGroup
        type="multiple"
        className="contents"
        value={[
          bonuses[playerIndex]?.greenBonus ? "green" : "",
          bonuses[playerIndex]?.yellowBonus ? "yellow" : "",
          bonuses[playerIndex]?.purpleBonus ? "purple" : "",
          bonuses[playerIndex]?.darkBonus ? "dark" : "",
        ].filter(Boolean)}
        onValueChange={handleColorChange}
      >
        <ToggleGroupItem
          value="green"
          className={cn(
            cellClass,
            "text-green-500 hover:text-green-600 data-[state=on]:text-green-600 focus:text-green-500",
            !showGreen && "invisible pointer-events-none"
          )}
        >
          +10
        </ToggleGroupItem>
        <ToggleGroupItem
          value="yellow"
          className={cn(
            cellClass,
            "text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-600 focus:text-yellow-500",
            !showYellow && "invisible pointer-events-none"
          )}
        >
          +10
        </ToggleGroupItem>
        <ToggleGroupItem
          value="purple"
          className={cn(
            cellClass,
            "text-purple-500 hover:text-purple-600 data-[state=on]:text-purple-600 focus:text-purple-500",
            !showPurple && "invisible pointer-events-none"
          )}
        >
          +10
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          className={cn(
            cellClass,
            !showDark && "invisible pointer-events-none"
          )}
        >
          +20
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="multiple"
        className="contents"
        value={[
          bonuses[playerIndex]?.treasure > 0 ? "treasure" : "",
          bonuses[playerIndex]?.mermaid > 0 ? "mermaid" : "",
          bonuses[playerIndex]?.pirate > 0 ? "pirate" : "",
          bonuses[playerIndex]?.skullKing ? "skullKing" : "",
        ].filter(Boolean)}
        onValueChange={handleSpecialChange}
      >
        <TreasureControl
          playerIndex={playerIndex}
          players={players}
          bonuses={bonuses}
          setBonuses={setBonuses}
        />
        <div className="relative flex items-center justify-center">
          <ToggleGroupItem value="mermaid" className={cellClass}>
            🧜‍♀️ {bonuses[playerIndex]?.mermaid || 0}
          </ToggleGroupItem>
          {bonuses[playerIndex]?.mermaid > 0 && (
            <div className="absolute right-1 flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="outline"
                className="h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustSpecialCard("mermaid", 1);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustSpecialCard("mermaid", -1);
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="relative flex items-center justify-center">
          <ToggleGroupItem value="pirate" className={cellClass}>
            🏴‍☠️ {bonuses[playerIndex]?.pirate || 0}
          </ToggleGroupItem>
          {bonuses[playerIndex]?.pirate > 0 && (
            <div className="absolute right-1 flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="outline"
                className="h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustSpecialCard("pirate", 1);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustSpecialCard("pirate", -1);
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <ToggleGroupItem
          value="skullKing"
          className={cn(
            row2CellClass,
            !showSkullKing && "invisible pointer-events-none"
          )}
        >
          💀👑
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
