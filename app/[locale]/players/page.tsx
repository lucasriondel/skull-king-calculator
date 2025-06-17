"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useMobile } from "@/hooks/use-mobile";
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
import { useEffect, useState } from "react";

// Define SortablePlayerItem component
function SortablePlayerItem({
  id,
  name,
  index,
  updatePlayerName,
  removePlayer,
  t,
}: {
  id: string;
  name: string;
  index: number;
  updatePlayerName: (index: number, name: string) => void;
  removePlayer: (index: number) => void;
  t: (key: string, params?: any) => string;
}) {
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
    touchAction: "none",
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
        aria-label={t("dragHandleLabel", { number: index + 1 })}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </span>
      <Input
        value={name}
        onChange={(e) => updatePlayerName(index, e.target.value)}
        placeholder={t("defaultPlayerName", { number: index + 1 })}
        className="flex-grow"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removePlayer(index)}
        // disabled prop is handled by the parent component's logic for playerNames.length
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default function PlayersPage() {
  const router = useRouter();
  const isMobile = useMobile();
  const { setPlayers, gameMode } = useGameStore();
  const t = useTranslations("PlayersPage");

  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedPlayers = localStorage.getItem("skullKingPlayers");
      if (savedPlayers) {
        return JSON.parse(savedPlayers);
      }
    }
    return [
      t("defaultPlayerName", { number: 1 }),
      t("defaultPlayerName", { number: 2 }),
    ];
  });

  useEffect(() => {
    localStorage.setItem("skullKingPlayers", JSON.stringify(playerNames));
  }, [playerNames]);

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
    if (over && active.id !== over.id) {
      setPlayerNames((items) => {
        const oldIndex = parseInt(String(active.id).split("-")[1]);
        const newIndex = parseInt(String(over.id).split("-")[1]);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([
        ...playerNames,
        t("defaultPlayerName", { number: playerNames.length + 1 }),
      ]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    setPlayers(playerNames.map((name) => ({ name, score: 0, rounds: [] })));
    router.push("/game");
  };

  if (!gameMode) {
    router.push("/game-modes");
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      <LanguageSwitcher />
      <ThemeToggleButton />
      <h1 className="text-3xl font-bold text-center mb-2">{t("title")}</h1>
      <p className="text-center text-muted-foreground mb-8">
        {t("modeInfo", { mode: gameMode.name, rounds: gameMode.rounds })}
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {t("playersHeader", { count: playerNames.length })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={playerNames.map((_, index) => `item-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              {playerNames.map((name, index) => (
                <SortablePlayerItem
                  key={`item-${index}`}
                  id={`item-${index}`}
                  name={name}
                  index={index}
                  updatePlayerName={updatePlayerName}
                  removePlayer={removePlayer}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            className="w-full"
            onClick={addPlayer}
            disabled={playerNames.length >= 8}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("addPlayer")}
          </Button>
        </CardContent>
      </Card>

      {!isMobile && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleStartGame}>
            {t("startGame")}
          </Button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container max-w-2xl mx-auto">
            <Button className="w-full" size="lg" onClick={handleStartGame}>
              {t("startGame")} <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
