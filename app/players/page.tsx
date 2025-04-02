"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, UserPlus, Play } from "lucide-react"
import { useGameStore } from "@/lib/store"
import { useMobile } from "@/hooks/use-mobile"

export default function PlayersPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { setPlayers, gameMode } = useGameStore()
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2"])

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`])
    }
  }

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index))
    }
  }

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  const handleStartGame = () => {
    setPlayers(playerNames.map((name) => ({ name, score: 0, rounds: [] })))
    router.push("/game")
  }

  if (!gameMode) {
    router.push("/game-modes")
    return null
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold text-center mb-2">Player Setup</h1>
      <p className="text-center text-muted-foreground mb-8">
        {gameMode.name} mode • {gameMode.rounds} rounds
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Players ({playerNames.length}/8)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayer(index)}
                disabled={playerNames.length <= 2}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addPlayer} disabled={playerNames.length >= 8}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </CardContent>
      </Card>

      {!isMobile && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleStartGame}>
            Start Game
          </Button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container max-w-2xl mx-auto">
            <Button className="w-full" size="lg" onClick={handleStartGame}>
              Start Game <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

