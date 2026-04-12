"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { type GameMode, useGameStore } from "@/lib/store";
import { useRouter } from "@/src/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const gameModes: GameMode[] = [
  {
    id: "classic",
    name: "Classic",
    rounds: 10,
    description: "The traditional Skull King game with 10 rounds.",
    cardsPerRound: (round) => round,
  },
  {
    id: "no-odd-rounds",
    name: "No Odd Rounds",
    rounds: 10,
    description: "Two rounds of 2, 4, 6, 8, 10 cards.",
    cardsPerRound: (round) => {
      if (round === 1 || round === 2) return 2;
      if (round === 3 || round === 4) return 4;
      if (round === 5 || round === 6) return 6;
      if (round === 7 || round === 8) return 8;
      return 10;
    },
  },
  {
    id: "ready-to-fight",
    name: "Ready to Fight",
    rounds: 5,
    description: "5 rounds: 6, 7, 8, 9 and 10 cards.",
    cardsPerRound: (round) => {
      if (round === 1) return 6;
      if (round === 2) return 7;
      if (round === 3) return 8;
      if (round === 4) return 9;
      if (round === 5) return 10;
      return 10;
    },
  },
  {
    id: "flash-attack",
    name: "Flash Attack",
    rounds: 5,
    description: "5 rounds with 5 cards.",
    cardsPerRound: () => 5,
  },
  {
    id: "dam-shooting",
    name: "Dam Shooting",
    rounds: 10,
    description: "10 rounds with 10 cards.",
    cardsPerRound: () => 10,
  },
  {
    id: "whirlwind",
    name: "Whirlwind",
    rounds: 10,
    description: "Two round of 9, 7, 5, 3, and 1 card.",
    cardsPerRound: (round) => {
      if (round === 1 || round === 2) return 9;
      if (round === 3 || round === 4) return 7;
      if (round === 5 || round === 6) return 5;
      if (round === 7 || round === 8) return 3;
      return 1;
    },
  },
  {
    id: "bed-time",
    name: "Bed Time",
    rounds: 1,
    description: "1 round with 1 card, then a goodnight kiss !",
    cardsPerRound: () => 1,
  },
];

export default function GameModesPage() {
  const router = useRouter();
  const { setGameMode } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const t = useTranslations("GameModesPage");

  const handleContinue = () => {
    const mode = gameModes.find((mode) => mode.id === selectedMode);
    if (mode) {
      // Use the translated values for the selected game mode
      const translatedMode = {
        ...mode,
        name: getModeTranslation(mode.id, "name"),
        description: getModeTranslation(mode.id, "description"),
      };
      setGameMode(translatedMode);
      router.push("/players");
    }
  };

  // Helper function to get translations for game mode properties
  function getModeTranslation(
    modeId: string,
    property: "name" | "description"
  ) {
    const idMap: Record<string, string> = {
      classic: "classic",
      "no-odd-rounds": "noOddRounds",
      "ready-to-fight": "readyToFight",
      "flash-attack": "flashAttack",
      "dam-shooting": "damShooting",
      whirlwind: "whirlwind",
      "bed-time": "bedTime",
    };

    try {
      return t.raw(`gameModes.${idMap[modeId]}.${property}`);
    } catch (e) {
      // Find the original mode for fallback
      const originalMode = gameModes.find((m) => m.id === modeId);
      return originalMode ? originalMode[property] : "";
    }
  }

  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-background border-b border-border border-x min-[673px]:rounded-b-lg">
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-xl font-semibold mb-4">{t("subtitle")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameModes.map((mode) => (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all ${
                selectedMode === mode.id
                  ? "ring-2 ring-primary"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <CardHeader>
                <CardTitle>{getModeTranslation(mode.id, "name")}</CardTitle>
                <CardDescription>{mode.rounds} rounds</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{getModeTranslation(mode.id, "description")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background border-t border-border p-4 border-x min-[673px]:rounded-t-lg pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedMode}
        >
          {t("continueButton")} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
