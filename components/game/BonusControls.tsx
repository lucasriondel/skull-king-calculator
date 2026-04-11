import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("GamePage");

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

  return (
    <div>
      <div className="mb-2">
        <ToggleGroup
          type="multiple"
          value={[
            bonuses[playerIndex]?.greenBonus ? "green" : "",
            bonuses[playerIndex]?.yellowBonus ? "yellow" : "",
            bonuses[playerIndex]?.purpleBonus ? "purple" : "",
            bonuses[playerIndex]?.darkBonus ? "dark" : "",
          ].filter(Boolean)}
          onValueChange={(values) => {
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

              // Handle turning off bonuses
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

              // Handle turning on bonuses
              const newValue = values[values.length - 1] as
                | "green"
                | "yellow"
                | "purple"
                | "dark";
              if (!newValue) return prev;

              // Find if another player has this bonus
              const otherPlayerIndex = getPlayerWithBonus(newValue);
              const result = { ...prev };

              // If another player has the bonus, remove it from them
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

              // Add the bonus to the current player
              result[playerIndex] = {
                ...playerBonuses,
                greenBonus: values.includes("green"),
                yellowBonus: values.includes("yellow"),
                purpleBonus: values.includes("purple"),
                darkBonus: values.includes("dark"),
              };

              return result;
            });
          }}
        >
          <ToggleGroupItem
            value="green"
            className={`text-green-500 hover:text-green-600 data-[state=on]:text-green-600 active:bg-transparent focus:bg-transparent focus:text-green-500 ${
              showGreen ? "" : "invisible pointer-events-none"
            }`}
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yellow"
            className={`text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-600 active:bg-transparent focus:bg-transparent focus:text-yellow-500 ${
              showYellow ? "" : "invisible pointer-events-none"
            }`}
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem
            value="purple"
            className={`text-purple-500 hover:text-purple-600 data-[state=on]:text-purple-600 active:bg-transparent focus:bg-transparent focus:text-purple-500 ${
              showPurple ? "" : "invisible pointer-events-none"
            }`}
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            className={showDark ? "" : "invisible pointer-events-none"}
          >
            +20
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-row">
        <ToggleGroup
          type="multiple"
          className="flex flex-wrap"
          value={[
            bonuses[playerIndex]?.treasure > 0 ? "treasure" : "",
            bonuses[playerIndex]?.mermaid > 0 ? "mermaid" : "",
            bonuses[playerIndex]?.pirate > 0 ? "pirate" : "",
            bonuses[playerIndex]?.skullKing ? "skullKing" : "",
          ].filter(Boolean)}
          onValueChange={(values) => {
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

              // Handle turning off bonuses
              const result = { ...prev };
              result[playerIndex] = {
                ...playerBonuses,
                treasure: values.includes("treasure")
                  ? playerBonuses.treasure || 1
                  : 0,
                mermaid: values.includes("mermaid")
                  ? playerBonuses.mermaid || 1
                  : 0,
                pirate: values.includes("pirate")
                  ? playerBonuses.pirate || 1
                  : 0,
                skullKing: values.includes("skullKing"),
              };

              // Special handling for Skull King
              if (values.includes("skullKing")) {
                const otherPlayerIndex = getPlayerWithBonus("skullKing");
                console.log("🔍 Debug - Skull King Check:", {
                  otherPlayerIndex,
                  currentPlayer: playerIndex,
                });

                if (
                  otherPlayerIndex !== null &&
                  otherPlayerIndex !== playerIndex
                ) {
                  result[otherPlayerIndex] = {
                    ...result[otherPlayerIndex],
                    skullKing: false,
                  };
                }
              }

              console.log("🔍 Debug - New State:", {
                result,
                updatedPlayerBonuses: result[playerIndex],
              });

              return result;
            });
          }}
        >
          <TreasureControl
            playerIndex={playerIndex}
            players={players}
            bonuses={bonuses}
            setBonuses={setBonuses}
          />
          <div className="flex items-center gap-1">
            <ToggleGroupItem value="mermaid">
              🧜‍♀️ {bonuses[playerIndex]?.mermaid || 0}
            </ToggleGroupItem>
            {bonuses[playerIndex]?.mermaid > 0 && (
              <div className="flex flex-col gap-0.5">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-5 w-5"
                  onClick={() => adjustSpecialCard("mermaid", 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-5 w-5"
                  onClick={() => adjustSpecialCard("mermaid", -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <ToggleGroupItem value="pirate">
            🏴‍☠️ {bonuses[playerIndex]?.pirate || 0}
          </ToggleGroupItem>
          {bonuses[playerIndex]?.pirate > 0 && (
            <div className="flex flex-col gap-0.5">
              <Button
                size="icon"
                variant="outline"
                className="h-5 w-5"
                onClick={() => adjustSpecialCard("pirate", 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-5 w-5"
                onClick={() => adjustSpecialCard("pirate", -1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          )}
          <ToggleGroupItem
            value="skullKing"
            className={showSkullKing ? "" : "invisible pointer-events-none"}
          >
            💀👑
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
