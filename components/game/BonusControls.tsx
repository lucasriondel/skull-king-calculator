import { Button } from "@/components/ui/button";
import { CardButtonGrid } from "@/components/ui/card-button-grid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { SuitBonusRow } from "./SuitBonusRow";
import { TreasureControl } from "./TreasureControl";

export type TreasureGroup = {
  id: string; // unique identifier for the group
  playerIndexes: number[]; // array of player indexes sharing treasure
  treasureCount: number; // number of shared treasures (1 or 2)
};

/**
 * The four suits, in display order. Each contributes one bonus cell (the 14
 * bonus: +10 for a color, +20 for trump) plus — with the expansion — its own
 * 7 (-5) and 8 (+5). The row renders as: -5 +5 +10 | -5 +5 +10 | ... | -5 +5 +20.
 */
export const SUITS = [
  { key: "green", bonusPoints: 10, textClass: "text-green-500 hover:text-green-600 data-[state=on]:text-green-600 focus:text-green-500" },
  { key: "yellow", bonusPoints: 10, textClass: "text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-600 focus:text-yellow-500" },
  { key: "purple", bonusPoints: 10, textClass: "text-purple-500 hover:text-purple-600 data-[state=on]:text-purple-600 focus:text-purple-500" },
  { key: "dark", bonusPoints: 20, textClass: "" },
] as const;

export type SuitKey = (typeof SUITS)[number]["key"];

/** `green` -> `greenBonus`, the existing 14-bonus field names. */
export type SuitBonusField = `${SuitKey}Bonus`;
/** `green` -> `greenPlusFive` / `greenMinusFive`. */
export type SuitPlusFiveField = `${SuitKey}PlusFive`;
export type SuitMinusFiveField = `${SuitKey}MinusFive`;

export type BonusType = {
  greenBonus: boolean;
  yellowBonus: boolean;
  purpleBonus: boolean;
  darkBonus: boolean;
  treasure: number;
  mermaid: number;
  pirate: number;
  skullKing: boolean;
  /**
   * Expansion: the 8 of each suit captured in your tricks (+5 each), and the
   * 7 of each suit (-5 each). One physical card per suit, so these are flags
   * rather than counters — which also makes them exclusive across players.
   */
  greenPlusFive: boolean;
  yellowPlusFive: boolean;
  purplePlusFive: boolean;
  darkPlusFive: boolean;
  greenMinusFive: boolean;
  yellowMinusFive: boolean;
  purpleMinusFive: boolean;
  darkMinusFive: boolean;
  /** Expansion: the Second captured in your tricks (+30). Single card. */
  second: number;
  treasureGroups?: TreasureGroup[];
};

/**
 * The zero-value bonus record. Every code path that lazily creates a player's
 * bonuses must start from this — a field missing here silently scores as 0,
 * and adding an expansion card previously meant editing five inline literals.
 */
export const emptyBonuses = (): BonusType => ({
  greenBonus: false,
  yellowBonus: false,
  purpleBonus: false,
  darkBonus: false,
  treasure: 0,
  mermaid: 0,
  pirate: 0,
  skullKing: false,
  greenPlusFive: false,
  yellowPlusFive: false,
  purplePlusFive: false,
  darkPlusFive: false,
  greenMinusFive: false,
  yellowMinusFive: false,
  purpleMinusFive: false,
  darkMinusFive: false,
  second: 0,
});

export type SuitCardField =
  | SuitBonusField
  | SuitPlusFiveField
  | SuitMinusFiveField;

/**
 * The suit row flattened into cells, in render order: for each suit its 7
 * (-5), its 8 (+5), then its 14 bonus (+10, or +20 for trump). The 7 and 8
 * cells only render with the expansion, which reduces the row to the original
 * four bonus cells. `value` is both the ToggleGroup value and the
 * `getPlayerWithBonus` key, so the three stay in sync by construction.
 */
export const SUIT_CARDS = SUITS.flatMap((suit) => [
  {
    value: `${suit.key}MinusFive` as const,
    field: `${suit.key}MinusFive` as const,
    label: "-5",
    textClass: suit.textClass,
    expansionOnly: true,
  },
  {
    value: `${suit.key}PlusFive` as const,
    field: `${suit.key}PlusFive` as const,
    label: "+5",
    textClass: suit.textClass,
    expansionOnly: true,
  },
  {
    value: suit.key,
    field: `${suit.key}Bonus` as const,
    label: `+${suit.bonusPoints}`,
    textClass: suit.textClass,
    expansionOnly: false,
  },
]);

/** Per-round ceiling for each countable special card. */
const SPECIAL_CARD_MAX = {
  mermaid: 2,
  treasure: 2,
  pirate: 6,
} as const;

type CountableCard = keyof typeof SPECIAL_CARD_MAX;

/**
 * Cards only one player can hold in a given round: the four 14s, the four 8s,
 * the four 7s, the Skull King and the Second.
 */
export type ExclusiveBonus =
  | SuitKey
  | SuitPlusFiveField
  | SuitMinusFiveField
  | "skullKing"
  | "second";

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
    const playerBonuses = result[playerIndex] || emptyBonuses();

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

interface Player {
  name: string;
  score: number;
}

// Shared base class for every bonus ToggleGroupItem (color bonuses,
// treasure/mermaid/pirate, skull king). Depresses to 0.96 on press —
// matching the number-selector cells beside it — off an explicit
// transform transition, neutralized under reduced motion (issue #12).
export const toggleClass =
  "rounded-none h-10 w-full min-w-0 px-0 border-0 data-[state=on]:bg-accent/60 transition-[color,background-color,transform] active:scale-[0.96] motion-reduce:active:scale-100";

// A +/- stepper that sits beside a bonus toggle. Each button is a 40x40 hit
// target (size-10) laid out as a flex sibling of the toggle, so its hit zone
// never overlaps the toggle behind it (issue #11).
function BonusStepper({
  onIncrement,
  onDecrement,
}: {
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col border-l">
      <Button
        size="icon"
        variant="ghost"
        className="size-10 rounded-none"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-10 rounded-none border-t"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
      >
        <Minus className="size-4" />
      </Button>
    </div>
  );
}

// A special-card toggle (mermaid/pirate) paired with a stepper that appears
// once the card is active so its count can be adjusted.
export function SpecialCardToggle({
  value,
  label,
  count,
  onIncrement,
  onDecrement,
}: {
  value: string;
  label: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex w-full min-h-10 items-stretch self-stretch">
      <ToggleGroupItem
        value={value}
        className={cn(toggleClass, "h-auto flex-1 self-stretch")}
      >
        {label} {count}
      </ToggleGroupItem>
      {count > 0 && (
        <BonusStepper onIncrement={onIncrement} onDecrement={onDecrement} />
      )}
    </div>
  );
}

interface BonusControlsProps {
  playerIndex: number;
  players: Player[];
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  getPlayerWithBonus: (color: ExclusiveBonus) => number | null;
  /** Expansion cards (7/8/Second) are opt-in per game. */
  expansion?: boolean;
  isLastSection?: boolean;
}

export function BonusControls({
  playerIndex,
  players,
  bonuses,
  setBonuses,
  getPlayerWithBonus,
  expansion = false,
  isLastSection = true,
}: BonusControlsProps) {
  // A single-card toggle is only offered to players who could still hold it:
  // nobody has claimed it, or this player already has.
  const isSuitCardVisible = (card: ExclusiveBonus) => {
    const owner = getPlayerWithBonus(card);
    return owner === null || owner === playerIndex;
  };

  const showSkullKing = isSuitCardVisible("skullKing");
  const showSecond = isSuitCardVisible("second");

  const adjustSpecialCard = (cardType: CountableCard, delta: number) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || emptyBonuses();

      const maxValue = SPECIAL_CARD_MAX[cardType];
      const currentValue = playerBonuses[cardType] || 0;
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

  /**
   * The suit row's toggles map 1:1 onto boolean fields — the 14 bonus, the 8
   * and the 7 of each suit. Every one is a single physical card, so claiming
   * one clears it from whoever held it before.
   */
  const handleColorChange = (values: string[]) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || emptyBonuses();

      const claimed = Object.fromEntries(
        SUIT_CARDS.map((card) => [card.field, values.includes(card.value)])
      ) as Record<SuitCardField, boolean>;

      const result = { ...prev };
      result[playerIndex] = { ...playerBonuses, ...claimed };

      // Clear each newly-claimed card from any other player holding it.
      for (const card of SUIT_CARDS) {
        if (!claimed[card.field]) continue;
        if (playerBonuses[card.field]) continue; // already ours, nothing to steal
        const otherPlayerIndex = getPlayerWithBonus(card.value);
        if (otherPlayerIndex !== null && otherPlayerIndex !== playerIndex) {
          result[otherPlayerIndex] = {
            ...result[otherPlayerIndex],
            [card.field]: false,
          };
        }
      }

      return result;
    });
  };

  const handleSpecialChange = (values: string[]) => {
    setBonuses((prev) => {
      const playerBonuses = prev[playerIndex] || emptyBonuses();

      const result = { ...prev };
      result[playerIndex] = {
        ...playerBonuses,
        treasure: values.includes("treasure")
          ? playerBonuses.treasure || 1
          : 0,
        mermaid: values.includes("mermaid") ? playerBonuses.mermaid || 1 : 0,
        pirate: values.includes("pirate") ? playerBonuses.pirate || 1 : 0,
        second: values.includes("second") ? 1 : 0,
        skullKing: values.includes("skullKing"),
      };

      // The Skull King and the Second are single cards: claiming one clears
      // it from whoever held it.
      if (values.includes("skullKing")) {
        const otherPlayerIndex = getPlayerWithBonus("skullKing");
        if (otherPlayerIndex !== null && otherPlayerIndex !== playerIndex) {
          result[otherPlayerIndex] = {
            ...result[otherPlayerIndex],
            skullKing: false,
          };
        }
      }

      if (values.includes("second")) {
        const otherPlayerIndex = getPlayerWithBonus("second");
        if (otherPlayerIndex !== null && otherPlayerIndex !== playerIndex) {
          result[otherPlayerIndex] = {
            ...result[otherPlayerIndex],
            second: 0,
          };
        }
      }

      return result;
    });
  };

  return (
    <>
      <SuitBonusRow
        playerIndex={playerIndex}
        bonuses={bonuses}
        expansion={expansion}
        isVisible={isSuitCardVisible}
        onValueChange={handleColorChange}
      />
      <CardButtonGrid.Row
        columns={expansion ? 5 : 4}
        isLastRow={isLastSection}
      >
        <ToggleGroup
          type="multiple"
          className="contents"
          value={[
            bonuses[playerIndex]?.treasure > 0 ? "treasure" : "",
            bonuses[playerIndex]?.mermaid > 0 ? "mermaid" : "",
            bonuses[playerIndex]?.pirate > 0 ? "pirate" : "",
            bonuses[playerIndex]?.second ? "second" : "",
            bonuses[playerIndex]?.skullKing ? "skullKing" : "",
          ].filter(Boolean)}
          onValueChange={handleSpecialChange}
        >
          <CardButtonGrid.Cell colIndex={0}>
            <TreasureControl
              playerIndex={playerIndex}
              players={players}
              bonuses={bonuses}
              setBonuses={setBonuses}
            />
          </CardButtonGrid.Cell>
          <CardButtonGrid.Cell colIndex={1} className="p-0">
            <SpecialCardToggle
              value="mermaid"
              label="🧜‍♀️"
              count={bonuses[playerIndex]?.mermaid || 0}
              onIncrement={() => adjustSpecialCard("mermaid", 1)}
              onDecrement={() => adjustSpecialCard("mermaid", -1)}
            />
          </CardButtonGrid.Cell>
          <CardButtonGrid.Cell colIndex={2} className="p-0">
            <SpecialCardToggle
              value="pirate"
              label="🏴‍☠️"
              count={bonuses[playerIndex]?.pirate || 0}
              onIncrement={() => adjustSpecialCard("pirate", 1)}
              onDecrement={() => adjustSpecialCard("pirate", -1)}
            />
          </CardButtonGrid.Cell>
          {expansion && (
            <CardButtonGrid.Cell colIndex={3}>
              <ToggleGroupItem
                value="second"
                className={cn(
                  toggleClass,
                  !showSecond && "invisible pointer-events-none"
                )}
              >
                🫡
              </ToggleGroupItem>
            </CardButtonGrid.Cell>
          )}
          <CardButtonGrid.Cell colIndex={expansion ? 4 : 3}>
            <ToggleGroupItem
              value="skullKing"
              className={cn(
                toggleClass,
                !showSkullKing && "invisible pointer-events-none"
              )}
            >
              💀👑
            </ToggleGroupItem>
          </CardButtonGrid.Cell>
        </ToggleGroup>
      </CardButtonGrid.Row>
    </>
  );
}
