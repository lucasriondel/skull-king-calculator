"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Crown, CircleEllipsis, ArrowRight, Check, Home } from "lucide-react"
import { useGameStore, type RoundData } from "@/lib/store"
import { useMobile } from "@/hooks/use-mobile"

export default function GamePage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { gameMode, players, updatePlayerRound, resetGame } = useGameStore()
  const [currentRound, setCurrentRound] = useState(1)
  const [activeTab, setActiveTab] = useState<"bids" | "tricks" | "scores">("bids")
  const [roundData, setRoundData] = useState<RoundData[]>([])
  const [gameComplete, setGameComplete] = useState(false)

  useEffect(() => {
    if (!gameMode || !players.length) {
      router.push("/game-modes")
      return
    }

    // Initialize round data
    setRoundData(
      players.map((player) => ({
        playerId: player.name,
        bid: 0,
        tricks: 0,
        score: 0,
      })),
    )
  }, [gameMode, players, router])

  const cardsThisRound = gameMode ? gameMode.cardsPerRound(currentRound) : 0

  const updateBid = (playerIndex: number, bid: number) => {
    if (bid < 0 || bid > cardsThisRound) return

    const newRoundData = [...roundData]
    newRoundData[playerIndex] = { ...newRoundData[playerIndex], bid }
    setRoundData(newRoundData)
  }

  const updateTricks = (playerIndex: number, tricks: number) => {
    if (tricks < 0 || tricks > cardsThisRound) return

    const newRoundData = [...roundData]
    newRoundData[playerIndex] = { ...newRoundData[playerIndex], tricks }
    setRoundData(newRoundData)
  }

  const calculateScore = (bid: number, tricks: number): number => {
    if (bid === 0) {
      return tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound
    } else {
      return bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks)
    }
  }

  const completeRound = () => {
    // Calculate scores
    const newRoundData = roundData.map((data) => ({
      ...data,
      score: calculateScore(data.bid, data.tricks),
    }))

    // Update player data
    newRoundData.forEach((data, index) => {
      updatePlayerRound(index, currentRound, data)
    })

    if (currentRound < gameMode!.rounds) {
      // Move to next round
      setCurrentRound(currentRound + 1)
      setRoundData(
        players.map((player) => ({
          playerId: player.name,
          bid: 0,
          tricks: 0,
          score: 0,
        })),
      )
      setActiveTab("bids")
    } else {
      // Game complete
      setGameComplete(true)
    }
  }

  const canCompleteBids = roundData.every((data) => data.bid >= 0 && data.bid <= cardsThisRound)
  const canCompleteTricks = roundData.every((data) => data.tricks >= 0 && data.tricks <= cardsThisRound)

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  // Get the current action button based on active tab
  const getActionButton = () => {
    if (activeTab === "bids") {
      return (
        <Button
          className="w-full"
          disabled={!canCompleteBids}
          onClick={() => setActiveTab("tricks")}
          size={isMobile ? "lg" : "default"}
        >
          {isMobile ? (
            <>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            "Continue to Tricks"
          )}
        </Button>
      )
    } else if (activeTab === "tricks") {
      return (
        <Button
          className="w-full"
          disabled={!canCompleteTricks}
          onClick={completeRound}
          size={isMobile ? "lg" : "default"}
        >
          {isMobile ? (
            <>
              Complete <Check className="ml-2 h-5 w-5" />
            </>
          ) : (
            "Complete Round"
          )}
        </Button>
      )
    } else {
      return (
        <Button className="w-full" onClick={() => setActiveTab("bids")} size={isMobile ? "lg" : "default"}>
          {isMobile ? "Back to Bids" : "Back to Bids"}
        </Button>
      )
    }
  }

  const handleNewGame = () => {
    resetGame()
    router.push("/game-modes")
  }

  if (gameComplete) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <Card>
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
            <CardTitle className="text-3xl">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Final Standings</h2>
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <div key={player.name} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-yellow-500 text-black" : index === 1 ? "bg-gray-300 text-black" : index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-xl font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
          {!isMobile && (
            <CardFooter className="flex justify-center">
              <Button size="lg" onClick={handleNewGame}>
                New Game
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Mobile Bottom Navigation Bar for Game Complete */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
            <div className="container max-w-2xl mx-auto">
              <Button className="w-full" size="lg" onClick={handleNewGame}>
                New Game <Home className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="w-full sm:w-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg px-4 py-3 shadow-md">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-white/20 rounded-full transform rotate-12"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1.5">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">Game Mode</div>
                <div className="text-xl font-bold truncate">{gameMode?.name}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg px-4 py-3 shadow-md">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-white/20 rounded-full transform -rotate-12"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1.5">
                  <CircleEllipsis className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">Round</div>
                <div className="text-xl font-bold">
                  {currentRound} <span className="text-sm opacity-80">of {gameMode?.rounds}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <div className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-4 py-3 shadow-md">
            <div className="mr-3 relative">
              <div className="absolute inset-0 bg-white/20 rounded-md transform rotate-6"></div>
              <div className="absolute inset-0 bg-white/20 rounded-md transform -rotate-3"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-md p-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-square-stack"
                >
                  <path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path>
                  <path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path>
                  <rect width="8" height="8" x="14" y="14" rx="2"></rect>
                </svg>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Cards this round</div>
              <div className="text-xl font-bold">{cardsThisRound}</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="bids">Bids</TabsTrigger>
          <TabsTrigger value="tricks" disabled={activeTab === "bids" && !canCompleteBids}>
            Tricks
          </TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Enter Bids</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map((player, index) => (
                <div key={player.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">{player.name}</Label>
                    <span className="text-sm font-medium">Bid: {roundData[index]?.bid || 0}</span>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex space-x-1" style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}>
                      {Array.from({ length: cardsThisRound + 1 }, (_, i) => (
                        <div
                          key={i}
                          onClick={() => updateBid(index, i)}
                          className={`
                            flex items-center justify-center w-9 h-9 rounded-full cursor-pointer
                            border transition-colors
                            ${
                              roundData[index]?.bid === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-accent border-input"
                            }
                          `}
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            {!isMobile && <CardFooter>{getActionButton()}</CardFooter>}
          </Card>
        </TabsContent>

        <TabsContent value="tricks">
          <Card>
            <CardHeader>
              <CardTitle>Enter Tricks Won</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map((player, index) => (
                <div key={player.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-base font-medium">{player.name}</Label>
                      <p className="text-sm text-muted-foreground">Bid: {roundData[index]?.bid}</p>
                    </div>
                    <span className="text-sm font-medium">Tricks: {roundData[index]?.tricks || 0}</span>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex space-x-1" style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}>
                      {Array.from({ length: cardsThisRound + 1 }, (_, i) => (
                        <div
                          key={i}
                          onClick={() => updateTricks(index, i)}
                          className={`
                            flex items-center justify-center w-9 h-9 rounded-full cursor-pointer
                            border transition-colors
                            ${
                              roundData[index]?.tricks === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-accent border-input"
                            }
                          `}
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            {!isMobile && <CardFooter>{getActionButton()}</CardFooter>}
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Current Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((player) => (
                    <div key={player.name} className="flex justify-between items-center p-3 rounded-lg bg-accent/50">
                      <span className="font-medium">{player.name}</span>
                      <span className="font-bold">{player.score}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
            {!isMobile && <CardFooter>{getActionButton()}</CardFooter>}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container max-w-2xl mx-auto">{getActionButton()}</div>
        </div>
      )}
    </div>
  )
}

