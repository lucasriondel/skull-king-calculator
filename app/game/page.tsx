"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Crown,
  CircleEllipsis,
  ArrowRight,
  Check,
  Home,
  Plus,
  Minus,
} from "lucide-react";
import { useGameStore, type RoundData } from "@/lib/store";
import { useMobile } from "@/hooks/use-mobile";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type BonusType = {
  greenBonus: boolean;
  yellowBonus: boolean;
  purpleBonus: boolean;
  darkBonus: boolean;
  mermaid: number;
  pirate: number;
  skullKing: boolean;
};

export default function GamePage() {
  const router = useRouter();
  const isMobile = useMobile();
  const { gameMode, players, updatePlayerRound, resetGame } = useGameStore();
  const [currentRound, setCurrentRound] = useState(1);
  const [activeTab, setActiveTab] = useState<"bids" | "tricks" | "scores">(
    "bids"
  );
  const [roundData, setRoundData] = useState<RoundData[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [bonuses, setBonuses] = useState<Record<number, BonusType>>({});

  useEffect(() => {
    if (!gameMode || !players.length) {
      router.push("/game-modes");
      return;
    }

    // Initialize round data
    setRoundData(
      players.map((player) => ({
        playerId: player.name,
        bid: 0,
        tricks: 0,
        score: 0,
      }))
    );
  }, [gameMode, players, router]);

  const cardsThisRound = gameMode ? gameMode.cardsPerRound(currentRound) : 0;

  const updateBid = (playerIndex: number, bid: number) => {
    if (bid < 0 || bid > cardsThisRound) return;

    const newRoundData = [...roundData];
    newRoundData[playerIndex] = { ...newRoundData[playerIndex], bid };
    setRoundData(newRoundData);
  };

  const updateTricks = (playerIndex: number, tricks: number) => {
    if (tricks < 0 || tricks > cardsThisRound) return;

    const newRoundData = [...roundData];
    newRoundData[playerIndex] = { ...newRoundData[playerIndex], tricks };
    setRoundData(newRoundData);
  };

  const calculateScore = (bid: number, tricks: number): number => {
    if (bid === 0) {
      return tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound;
    } else {
      return bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks);
    }
  };

  const completeRound = () => {
    // Calculate scores
    const newRoundData = roundData.map((data) => ({
      ...data,
      score: calculateScore(data.bid, data.tricks),
    }));

    // Update player data
    newRoundData.forEach((data, index) => {
      updatePlayerRound(index, currentRound, data);
    });

    if (currentRound < gameMode!.rounds) {
      // Move to next round
      setCurrentRound(currentRound + 1);
      setRoundData(
        players.map((player) => ({
          playerId: player.name,
          bid: 0,
          tricks: 0,
          score: 0,
        }))
      );
      setActiveTab("bids");
    } else {
      // Game complete
      setGameComplete(true);
    }
  };

  const canCompleteBids = roundData.every(
    (data) => data.bid >= 0 && data.bid <= cardsThisRound
  );
  const canCompleteTricks = roundData.every(
    (data) => data.tricks >= 0 && data.tricks <= cardsThisRound
  );

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

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
      );
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
      );
    } else {
      return (
        <Button
          className="w-full"
          onClick={() => setActiveTab("bids")}
          size={isMobile ? "lg" : "default"}
        >
          {isMobile ? "Back to Bids" : "Back to Bids"}
        </Button>
      );
    }
  };

  const handleNewGame = () => {
    resetGame();
    router.push("/game-modes");
  };

  const toggleBonus = (playerIndex: number, bonusKey: keyof BonusType) => {
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

      if (bonusKey === "mermaid" || bonusKey === "pirate") {
        return {
          ...prev,
          [playerIndex]: {
            ...playerBonuses,
            [bonusKey]: playerBonuses[bonusKey] > 0 ? 0 : 1,
          },
        };
      }

      return {
        ...prev,
        [playerIndex]: {
          ...playerBonuses,
          [bonusKey]: !playerBonuses[bonusKey],
        },
      };
    });
  };

  const adjustSpecialCard = (
    playerIndex: number,
    cardType: "mermaid" | "pirate",
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

      const newValue = Math.max(0, (playerBonuses[cardType] || 0) + delta);

      return {
        ...prev,
        [playerIndex]: {
          ...playerBonuses,
          [cardType]: newValue,
        },
      };
    });
  };

  const isColorBonusTaken = (
    color: "green" | "yellow" | "purple" | "dark",
    currentPlayerIndex: number
  ) => {
    return Object.entries(bonuses).some(([playerIndex, playerBonuses]) => {
      const index = parseInt(playerIndex);
      if (index === currentPlayerIndex) return false;

      switch (color) {
        case "green":
          return playerBonuses.greenBonus;
        case "yellow":
          return playerBonuses.yellowBonus;
        case "purple":
          return playerBonuses.purpleBonus;
        case "dark":
          return playerBonuses.darkBonus;
        default:
          return false;
      }
    });
  };

  const getPlayerWithBonus = (
    color: "green" | "yellow" | "purple" | "dark"
  ): number | null => {
    const entry = Object.entries(bonuses).find(([_, playerBonuses]) => {
      switch (color) {
        case "green":
          return playerBonuses.greenBonus;
        case "yellow":
          return playerBonuses.yellowBonus;
        case "purple":
          return playerBonuses.purpleBonus;
        case "dark":
          return playerBonuses.darkBonus;
        default:
          return false;
      }
    });
    return entry ? parseInt(entry[0]) : null;
  };

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
                <div
                  key={player.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-300 text-black"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
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
    );
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
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Game Mode
                </div>
                <div className="text-xl font-bold truncate">
                  {gameMode?.name}
                </div>
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
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Round
                </div>
                <div className="text-xl font-bold">
                  {currentRound}{" "}
                  <span className="text-sm opacity-80">
                    of {gameMode?.rounds}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <div className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-4 py-3 shadow-md">
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
              <div className="text-xs uppercase tracking-wider opacity-80">
                Cards this round
              </div>
              <div className="text-xl font-bold">{cardsThisRound}</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="bids">Bids</TabsTrigger>
          <TabsTrigger
            value="tricks"
            disabled={activeTab === "bids" && !canCompleteBids}
          >
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
                    <Label className="text-base font-medium">
                      {player.name}
                    </Label>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div
                      className="flex space-x-1"
                      style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}
                    >
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
                      <Label className="text-base font-medium">
                        {player.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Bid: {roundData[index]?.bid}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score:{" "}
                        {calculateScore(
                          roundData[index]?.bid || 0,
                          roundData[index]?.tricks || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2">
                        <ToggleGroup
                          type="multiple"
                          value={[
                            bonuses[index]?.greenBonus ? "green" : "",
                            bonuses[index]?.yellowBonus ? "yellow" : "",
                            bonuses[index]?.purpleBonus ? "purple" : "",
                            bonuses[index]?.darkBonus ? "dark" : "",
                          ].filter(Boolean)}
                          onValueChange={(values) => {
                            setBonuses((prev) => {
                              const playerBonuses = prev[index] || {
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
                                Object.values(prev[index] || {}).filter(Boolean)
                                  .length
                              ) {
                                return {
                                  ...prev,
                                  [index]: {
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
                              const otherPlayerIndex =
                                getPlayerWithBonus(newValue);
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
                              result[index] = {
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
                            bonuses[index]?.mermaid > 0 ? "mermaid" : "",
                            bonuses[index]?.pirate > 0 ? "pirate" : "",
                            bonuses[index]?.skullKing ? "skullKing" : "",
                          ].filter(Boolean)}
                          onValueChange={(values) => {
                            setBonuses((prev) => {
                              const playerBonuses = prev[index] || {
                                greenBonus: false,
                                yellowBonus: false,
                                purpleBonus: false,
                                darkBonus: false,
                                mermaid: 0,
                                pirate: 0,
                                skullKing: false,
                              };
                              return {
                                ...prev,
                                [index]: {
                                  ...playerBonuses,
                                  mermaid: values.includes("mermaid")
                                    ? Math.max(1, playerBonuses.mermaid)
                                    : 0,
                                  pirate: values.includes("pirate")
                                    ? Math.max(1, playerBonuses.pirate)
                                    : 0,
                                  skullKing: values.includes("skullKing"),
                                },
                              };
                            });
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <ToggleGroupItem value="mermaid">
                              🧜‍♀️ {bonuses[index]?.mermaid || 0}
                            </ToggleGroupItem>
                            {bonuses[index]?.mermaid > 0 && (
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-5 w-5"
                                  onClick={() =>
                                    adjustSpecialCard(index, "mermaid", 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-5 w-5"
                                  onClick={() =>
                                    adjustSpecialCard(index, "mermaid", -1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <ToggleGroupItem value="pirate" className="">
                              🏴‍☠️ {bonuses[index]?.pirate || 0}
                            </ToggleGroupItem>
                            {bonuses[index]?.pirate > 0 && (
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-5 w-5"
                                  onClick={() =>
                                    adjustSpecialCard(index, "pirate", 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-5 w-5"
                                  onClick={() =>
                                    adjustSpecialCard(index, "pirate", -1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <ToggleGroupItem value="skullKing">
                            💀👑
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div
                      className="flex space-x-1"
                      style={{ minWidth: `${(cardsThisRound + 1) * 40}px` }}
                    >
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
                    <div
                      key={player.name}
                      className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
                    >
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
  );
}
