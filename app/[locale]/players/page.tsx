"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useGameStore } from "@/lib/store";
import { useRouter } from "@/src/i18n/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";

// Define SortablePlayerItem component
const SortablePlayerItem = forwardRef<
  HTMLInputElement,
  {
    id: string;
    player: { id: string; name: string };
    updatePlayerName: (id: string, name: string) => void;
    removePlayer: (id: string) => void;
    disableDelete: boolean;
    t: (key: string, params?: any) => string;
  }
>(function SortablePlayerItem(
  { id, player, updatePlayerName, removePlayer, disableDelete, t },
  ref
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded-md shadow"
    >
      {/* Drag handle */}
      <span
        className="cursor-grab active:cursor-grabbing touch-none select-none flex items-center pr-2"
        {...attributes}
        {...listeners}
        tabIndex={0}
        aria-label="Drag to reorder"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </span>
      <Input
        ref={ref}
        id={`player-input-${player.id}`}
        value={player.name}
        onChange={(e) => updatePlayerName(player.id, e.target.value)}
        placeholder={"Player name"}
        className="flex-grow"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removePlayer(player.id)}
        disabled={disableDelete}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
});

export default function PlayersPage() {
  const router = useRouter();
  const {
    setPlayers: setGamePlayers,
    setStartingPlayerIndex,
    setPiratePowers,
    gameMode,
  } = useGameStore();
  const t = useTranslations("PlayersPage");

  // Use objects with stable IDs instead of just strings
  const [playerList, setPlayerList] = useState<{ id: string; name: string }[]>(
    () => {
      if (typeof window !== "undefined") {
        const savedPlayers = localStorage.getItem("skullKingPlayers");
        if (savedPlayers) {
          const names = JSON.parse(savedPlayers);
          return names.map((name: string, index: number) => ({
            id: `player-${index}`,
            name,
          }));
        }
      }
      return [
        { id: "player-0", name: t("defaultPlayerName", { number: 1 }) },
        { id: "player-1", name: t("defaultPlayerName", { number: 2 }) },
      ];
    }
  );

  const prevPlayerNamesLengthRef = useRef(playerList.length);

  // Refs for player inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Save player names to localStorage whenever they change
  // And focus the last input if a player was added
  useEffect(() => {
    const playerNames = playerList.map((player) => player.name);
    localStorage.setItem("skullKingPlayers", JSON.stringify(playerNames));
    if (playerNames.length > prevPlayerNamesLengthRef.current) {
      // Focus the last input using refs
      const lastInputRef = inputRefs.current[playerNames.length - 1];
      if (lastInputRef) {
        lastInputRef.focus();
      }
    }
    prevPlayerNamesLengthRef.current = playerNames.length;
  }, [playerList]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPlayerList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addPlayer = () => {
    if (playerList.length < 8) {
      const newId = `player-${Date.now()}`;
      setPlayerList([
        ...playerList,
        {
          id: newId,
          name: t("defaultPlayerName", { number: playerList.length + 1 }),
        },
      ]);
    }
  };

  const removePlayer = (playerId: string) => {
    if (playerList.length > 2) {
      setPlayerList(playerList.filter((player) => player.id !== playerId));
    }
  };

  const updatePlayerName = (playerId: string, name: string) => {
    setPlayerList(
      playerList.map((player) =>
        player.id === playerId ? { ...player, name } : player
      )
    );
  };

  const [randomizeStarter, setRandomizeStarter] = useState(false);
  const [playingWithPiratePowers, setPlayingWithPiratePowers] = useState(false);

  const handleStartGame = () => {
    if (randomizeStarter) {
      setStartingPlayerIndex(Math.floor(Math.random() * playerList.length));
    } else {
      setStartingPlayerIndex(0);
    }
    setPiratePowers(playingWithPiratePowers);
    setGamePlayers(
      playerList.map((player) => ({ name: player.name, score: 0, rounds: [] }))
    );
    router.push("/game");
  };

  function RandomizeStarterCheckbox() {
    return (
      <div className="flex items-center mb-4 gap-2">
        <Checkbox
          id="randomize-starter"
          checked={randomizeStarter}
          onCheckedChange={(checked) => setRandomizeStarter(!!checked)}
        />
        <label
          htmlFor="randomize-starter"
          className="select-none cursor-pointer"
        >
          {t("randomizeStarter", { default: "Randomize who starts first" })}
        </label>
      </div>
    );
  }

  if (!gameMode) {
    router.push("/game-modes");
    return null;
  }

  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-background border-b border-border border-x min-[673px]:rounded-b-lg">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Skull King" width={32} height={32} className="rounded" />
          <div>
            <h1 className="text-lg font-bold">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("modeInfo", { mode: gameMode.name, rounds: gameMode.rounds })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("playersHeader", { count: playerList.length })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playerList.map((player) => player.id)}
                strategy={verticalListSortingStrategy}
              >
                {playerList.map((player, idx) => (
                  <SortablePlayerItem
                    key={player.id}
                    id={player.id}
                    player={player}
                    updatePlayerName={updatePlayerName}
                    removePlayer={removePlayer}
                    disableDelete={playerList.length <= 2}
                    t={t}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              className="w-full"
              onClick={addPlayer}
              disabled={
                playerList.length >= 8 ||
                playerList.some((player) => player.name === "")
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("addPlayer")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background border-t border-border p-4 border-x min-[673px]:rounded-t-lg pb-[max(1rem,env(safe-area-inset-bottom))]">
        <RandomizeStarterCheckbox />
        <div className="flex items-center mb-4 gap-2">
          <Checkbox
            id="pirate-powers"
            checked={playingWithPiratePowers}
            onCheckedChange={(checked) => setPlayingWithPiratePowers(!!checked)}
          />
          <label
            htmlFor="pirate-powers"
            className="select-none cursor-pointer"
          >
            {t("piratePowers")}
          </label>
        </div>
        <Button className="w-full" size="lg" onClick={handleStartGame}>
          {t("startGame")} <Play className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
