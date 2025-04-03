"use client";

import { create } from "zustand";
import { BonusType } from "@/components/game/BonusControls";
import { calculateScore } from "@/lib/game-utils";

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
  tricks: number;
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
  setGameMode: (mode: GameMode) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayerRound: (
    playerIndex: number,
    roundNumber: number,
    data: RoundData
  ) => void;
  resetGame: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameMode: null,
  players: [],

  setGameMode: (mode) => set({ gameMode: mode }),

  setPlayers: (players) => set({ players }),

  updatePlayerRound: (playerIndex, roundNumber, data) =>
    set((state) => {
      const newPlayers = [...state.players];
      const player = newPlayers[playerIndex];

      // If we have bonuses and cardsThisRound, recalculate the score
      if (data.bonuses && data.cardsThisRound) {
        data.score = calculateScore(
          data.bid,
          data.tricks,
          data.cardsThisRound,
          data.bonuses
        );
      }

      // Simply push the new round data to the rounds array
      player.rounds.push(data);

      // Recalculate total score
      player.score = player.rounds.reduce((sum, round) => sum + round.score, 0);
      console.log("PLAYER.ROUNDS", player.rounds);

      return { players: newPlayers };
    }),

  resetGame: () => set({ gameMode: null, players: [] }),
}));
