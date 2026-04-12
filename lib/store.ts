"use client";

import { BonusType } from "@/components/game/BonusControls";
import { create } from "zustand";

export type GameMode = {
  id: string;
  name: string;
  rounds: number;
  description: string;
  cardsPerRound: (round: number) => number;
};

export type RoundData = {
  playerId: string;
  bid: number;
  tricks: number | undefined;
  score: number;
  bonuses?: BonusType;
  cardsThisRound?: number;
};

export type Player = {
  name: string;
  score: number;
  rounds: RoundData[];
};

type GameStore = {
  gameMode: GameMode | null;
  players: Player[];
  startingPlayerIndex: number;
  piratePowers: boolean;
  setGameMode: (mode: GameMode) => void;
  setPlayers: (players: Player[]) => void;
  setStartingPlayerIndex: (index: number) => void;
  setPiratePowers: (enabled: boolean) => void;
  updatePlayerRound: (
    playerIndex: number,
    roundNumber: number,
    data: RoundData
  ) => void;
  moveToNextStartingPlayer: () => void;
  resetGame: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameMode: null,
  players: [],
  startingPlayerIndex: 0,
  piratePowers: false,

  setGameMode: (mode) => set({ gameMode: mode }),

  setPiratePowers: (enabled) => set({ piratePowers: enabled }),

  setPlayers: (players) => set({ players }),

  setStartingPlayerIndex: (index) => set({ startingPlayerIndex: index }),

  updatePlayerRound: (playerIndex, roundNumber, data) =>
    set((state) => {
      const newPlayers = [...state.players];
      const player = newPlayers[playerIndex];

      // Simply push the new round data to the rounds array
      player.rounds.push(data);

      // Recalculate total score
      player.score = player.rounds.reduce((sum, round) => sum + round.score, 0);
      console.log("PLAYER.ROUNDS", player.rounds);

      return { players: newPlayers };
    }),

  moveToNextStartingPlayer: () =>
    set((state) => {
      const nextIndex =
        state.players.length === 0
          ? 0
          : (state.startingPlayerIndex + 1) % state.players.length;
      return { startingPlayerIndex: nextIndex };
    }),

  resetGame: () => set({ gameMode: null, players: [], startingPlayerIndex: 0, piratePowers: false }),
}));
