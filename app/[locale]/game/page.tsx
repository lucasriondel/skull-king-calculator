"use client";

import { BidsTab } from "@/components/game/BidsTab";
import { BonusType } from "@/components/game/BonusControls";
import { DetailsTab } from "@/components/game/DetailsTab";
import { GameComplete } from "@/components/game/GameComplete";
import { GameHeader } from "@/components/game/GameHeader";
import { ScoresTab } from "@/components/game/ScoresTab";
import { TricksTab } from "@/components/game/TricksTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";
import { calculateScore } from "@/lib/game-utils";
import { useGameStore, type RoundData } from "@/lib/store";
import { useRouter } from "@/src/i18n/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function GamePage() {
  const router = useRouter();
  const isMobile = useMobile();
  const {
    gameMode,
    players,
    updatePlayerRound,
    resetGame,
    moveToNextStartingPlayer,
  } = useGameStore();
  const [currentRound, setCurrentRound] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "bids" | "tricks" | "scores" | "details"
  >("bids");
  const [roundData, setRoundData] = useState<RoundData[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [bonuses, setBonuses] = useState<Record<number, BonusType>>({});
  const t = useTranslations("GamePage");

  console.log(roundData);

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
        tricks: undefined,
        score: 0,
      }))
    );
  }, [gameMode, players, router]);

  const cardsThisRound = gameMode ? gameMode.cardsPerRound(currentRound) : 0;

  const updateBid = (playerIndex: number, bid: number) => {
    if (bid < 0 || bid > cardsThisRound) return;

    const newRoundData = [...roundData];
    newRoundData[playerIndex] = {
      ...newRoundData[playerIndex],
      bid,
      bonuses: bonuses[playerIndex],
      cardsThisRound,
    };
    setRoundData(newRoundData);
  };

  const updateTricks = (playerIndex: number, tricks: number) => {
    if (tricks < 0 || tricks > cardsThisRound) return;

    const newRoundData = [...roundData];
    newRoundData[playerIndex] = {
      ...newRoundData[playerIndex],
      tricks,
      bonuses: bonuses[playerIndex],
      cardsThisRound,
    };
    setRoundData(newRoundData);
  };

  const completeRound = () => {
    console.log("completeRound called with:", {
      roundData,
      currentRound,
      bonuses,
      players,
    });

    // Calculate scores
    const allBidTricks = roundData.map((d) => ({
      bid: d.bid,
      tricks: d.tricks ?? 0,
    }));
    const newRoundData = roundData.map((data, idx) => {
      const score = calculateScore(
        data.bid,
        data.tricks ?? 0,
        cardsThisRound,
        bonuses[idx],
        idx,
        allBidTricks
      );
      console.log(`Player ${idx} score calculation:`, {
        playerName: players[idx]?.name,
        bid: data.bid,
        tricks: data.tricks,
        bonuses: bonuses[idx],
        score,
      });

      return {
        ...data,
        score,
        bonuses: bonuses[idx],
        cardsThisRound,
      };
    });

    // Update player data with the correct round number
    newRoundData.forEach((data, index) => {
      console.log(`Updating player ${index} for round ${currentRound}`);
      updatePlayerRound(index, currentRound, data);
    });

    if (currentRound < gameMode!.rounds) {
      // Move to next round
      setCurrentRound(currentRound + 1);
      setRoundData(
        players.map((player) => ({
          playerId: player.name,
          bid: 0,
          tricks: undefined,
          score: 0,
        }))
      );
      setBonuses({}); // Reset bonuses for the new round
      moveToNextStartingPlayer();
      setActiveTab("bids");
    } else {
      // Game complete
      setGameComplete(true);
    }
  };

  const goToTricks = () => {
    setRoundData((prev) =>
      prev.map((data) => ({ ...data, tricks: undefined }))
    );
    setActiveTab("tricks");
  };

  const canCompleteBids = roundData.every(
    (data) => data.bid >= 0 && data.bid <= cardsThisRound
  );
  const canCompleteTricks = roundData.every(
    (data) =>
      data.tricks !== undefined &&
      data.tricks >= 0 &&
      data.tricks <= cardsThisRound
  );

  const getPlayerWithBonus = (
    color: "green" | "yellow" | "purple" | "dark" | "skullKing"
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
        case "skullKing":
          return playerBonuses.skullKing;
        default:
          return false;
      }
    });
    return entry ? parseInt(entry[0]) : null;
  };

  const handleNewGame = () => {
    resetGame();
    router.push("/game-modes");
  };

  if (gameComplete) {
    return <GameComplete players={players} onNewGame={handleNewGame} />;
  }

  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto">
      <GameHeader
        gameModeName={gameMode?.name || ""}
        currentRound={currentRound}
        totalRounds={gameMode?.rounds || 0}
        cardsThisRound={cardsThisRound}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <TabsContent value="bids">
            <BidsTab
              players={players}
              roundData={roundData}
              updateBid={updateBid}
              cardsThisRound={cardsThisRound}
              canCompleteBids={canCompleteBids}
              onContinue={goToTricks}
            />
          </TabsContent>

          <TabsContent value="tricks">
            <TricksTab
              players={players}
              roundData={roundData}
              updateTricks={updateTricks}
              cardsThisRound={cardsThisRound}
              canCompleteTricks={canCompleteTricks}
              bonuses={bonuses}
              setBonuses={setBonuses}
              getPlayerWithBonus={getPlayerWithBonus}
              calculateScore={(bid, tricks, playerBonuses, playerIndex) =>
                calculateScore(
                  bid,
                  tricks,
                  cardsThisRound,
                  playerBonuses,
                  playerIndex,
                  roundData.map((d) => ({ bid: d.bid, tricks: d.tricks ?? 0 }))
                )
              }
              onComplete={completeRound}
            />
          </TabsContent>

          <TabsContent value="scores">
            <ScoresTab
              players={players}
              onBackToBids={() => setActiveTab("bids")}
            />
          </TabsContent>

          <TabsContent value="details">
            <DetailsTab />
          </TabsContent>
        </div>

        {isMobile && (
          <div className="shrink-0 bg-background border-t border-border p-4">
            {activeTab === "bids" && (
              <Button
                className="w-full"
                disabled={!canCompleteBids}
                onClick={goToTricks}
                size="lg"
              >
                {t("buttons.continue")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            {activeTab === "tricks" && (
              <Button
                className="w-full"
                disabled={!canCompleteTricks}
                onClick={completeRound}
                size="lg"
              >
                {t("buttons.complete")} <Check className="ml-2 h-5 w-5" />
              </Button>
            )}
            {(activeTab === "scores" || activeTab === "details") && (
              <Button
                className="w-full"
                onClick={() => setActiveTab("bids")}
                size="lg"
              >
                {t("buttons.backToBids")}
              </Button>
            )}
          </div>
        )}

        <TabsList className="shrink-0 grid w-full grid-cols-4 h-14 rounded-none border-t border-border">
          <TabsTrigger value="bids" className="py-3">{t("tabs.bids")}</TabsTrigger>
          <TabsTrigger
            value="tricks"
            className="py-3"
            disabled={activeTab === "bids" && !canCompleteBids}
          >
            {t("tabs.tricks")}
          </TabsTrigger>
          <TabsTrigger value="scores" className="py-3">{t("tabs.scores")}</TabsTrigger>
          <TabsTrigger value="details" className="py-3">{t("tabs.details")}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
