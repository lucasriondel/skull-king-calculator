import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslations } from "next-intl";

export type BonusType = {
  greenBonus: boolean;
  yellowBonus: boolean;
  purpleBonus: boolean;
  darkBonus: boolean;
  treasure: number;
  mermaid: number;
  pirate: number;
  skullKing: boolean;
};

interface BonusControlsProps {
  playerIndex: number;
  bonuses: Record<number, BonusType>;
  setBonuses: React.Dispatch<React.SetStateAction<Record<number, BonusType>>>;
  getPlayerWithBonus: (
    color: "green" | "yellow" | "purple" | "dark" | "skullKing"
  ) => number | null;
}

export function BonusControls({
  playerIndex,
  bonuses,
  setBonuses,
  getPlayerWithBonus,
}: BonusControlsProps) {
  const t = useTranslations("GamePage");

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
            className="text-green-500 hover:text-green-600 data-[state=on]:text-green-600 active:bg-transparent focus:bg-transparent focus:text-green-500"
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yellow"
            className="text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-600 active:bg-transparent focus:bg-transparent focus:text-yellow-500"
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem
            value="purple"
            className="text-purple-500 hover:text-purple-600 data-[state=on]:text-purple-600 active:bg-transparent focus:bg-transparent focus:text-purple-500"
          >
            +10
          </ToggleGroupItem>
          <ToggleGroupItem value="dark">+20</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex">
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
              if (
                values.length <
                Object.values(prev[playerIndex] || {}).filter(Boolean).length
              ) {
                return {
                  ...prev,
                  [playerIndex]: {
                    ...playerBonuses,
                    treasure: values.includes("treasure")
                      ? playerBonuses.treasure
                      : 0,
                    mermaid: values.includes("mermaid")
                      ? playerBonuses.mermaid
                      : 0,
                    pirate: values.includes("pirate")
                      ? playerBonuses.pirate
                      : 0,
                    skullKing: values.includes("skullKing"),
                  },
                };
              }

              // Handle turning on bonuses
              const newValue = values[values.length - 1];
              if (!newValue) return prev;

              const result = { ...prev };

              // Special handling for Skull King
              if (newValue === "skullKing") {
                const otherPlayerIndex = getPlayerWithBonus("skullKing");
                if (otherPlayerIndex !== null) {
                  result[otherPlayerIndex] = {
                    ...result[otherPlayerIndex],
                    skullKing: false,
                  };
                }
              }

              // Add the bonus to the current player
              result[playerIndex] = {
                ...playerBonuses,
                treasure: values.includes("treasure")
                  ? Math.max(1, playerBonuses.treasure)
                  : 0,
                mermaid: values.includes("mermaid")
                  ? Math.max(1, playerBonuses.mermaid)
                  : 0,
                pirate: values.includes("pirate")
                  ? Math.max(1, playerBonuses.pirate)
                  : 0,
                skullKing: values.includes("skullKing"),
              };

              return result;
            });
          }}
        >
          <div className="flex items-center gap-1">
            <ToggleGroupItem value="treasure">
              🏆 {bonuses[playerIndex]?.treasure || 0}
            </ToggleGroupItem>
            {bonuses[playerIndex]?.treasure > 0 && (
              <div className="flex flex-col gap-0.5">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-5 w-5"
                  onClick={() => adjustSpecialCard("treasure" as any, 1)}
                  disabled={bonuses[playerIndex]?.treasure >= 2}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-5 w-5"
                  onClick={() => adjustSpecialCard("treasure" as any, -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
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
          <ToggleGroupItem value="skullKing">💀👑</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
