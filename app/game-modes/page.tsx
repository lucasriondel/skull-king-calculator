"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type GameMode, useGameStore } from "@/lib/store"
import { useMobile } from "@/hooks/use-mobile"
import { ArrowRight } from "lucide-react"

const gameModes: GameMode[] = [
  {
    id: "classic",
    name: "Classic",
    rounds: 10,
    description: "The traditional Skull King game with 10 rounds.",
    cardsPerRound: (round) => round,
  },
  {
    id: "quick",
    name: "Quick Play",
    rounds: 6,
    description: "A shorter version with 6 rounds for faster gameplay.",
    cardsPerRound: (round) => round,
  },
  {
    id: "advanced",
    name: "Advanced",
    rounds: 8,
    description: "8 rounds with varying card distribution for experienced players.",
    cardsPerRound: (round) => Math.min(round + 2, 10),
  },
]

export default function GameModesPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { setGameMode } = useGameStore()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  const handleContinue = () => {
    const mode = gameModes.find((mode) => mode.id === selectedMode)
    if (mode) {
      setGameMode(mode)
      router.push("/players")
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold text-center mb-8">Skull King Score Tracker</h1>
      <h2 className="text-xl font-semibold mb-4">Select Game Mode</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {gameModes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all ${selectedMode === mode.id ? "ring-2 ring-primary" : "hover:bg-accent/50"}`}
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
            <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedMode}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

