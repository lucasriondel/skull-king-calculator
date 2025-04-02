"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type GameMode, useGameStore } from "@/lib/store";
import { useMobile } from "@/hooks/use-mobile";
import { ArrowRight } from "lucide-react";

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
      if (round === 1 || round === 2) return 6;
      if (round === 3 || round === 4) return 7;
      if (round === 5 || round === 6) return 8;
      if (round === 7 || round === 8) return 9;
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
  const isMobile = useMobile();
  const { setGameMode } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleContinue = () => {
    const mode = gameModes.find((mode) => mode.id === selectedMode);
    if (mode) {
      setGameMode(mode);
      router.push("/players");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Skull King Score Tracker
      </h1>
      <h2 className="text-xl font-semibold mb-4">Select Game Mode</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
              <CardTitle>{mode.name}</CardTitle>
              <CardDescription>{mode.rounds} rounds</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{mode.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isMobile && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleContinue} disabled={!selectedMode}>
            Continue to Player Setup
          </Button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container max-w-4xl mx-auto">
            <Button
              className="w-full"
              size="lg"
              onClick={handleContinue}
              disabled={!selectedMode}
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
