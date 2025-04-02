"use client"

import { create } from "zustand"

export type GameMode = {
  id: string
  name: string
  rounds: number
  description: string
  cardsPerRound: (round: number) => number
}

export type RoundData = {
  playerId: string
  bid: number
  tricks: number
  score: number
}

export type Player = {
  name: string
  score: number
  rounds: RoundData[]
}

type GameStore = {
  gameMode: GameMode | null
  players: Player[]
  setGameMode: (mode: GameMode) => void
  setPlayers: (players: Player[]) => void
  updatePlayerRound: (playerIndex: number, roundNumber: number, data: RoundData) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  gameMode: null,
  players: [],

  setGameMode: (mode) => set({ gameMode: mode }),

  setPlayers: (players) => set({ players }),

  updatePlayerRound: (playerIndex, roundNumber, data) =>
    set((state) => {
      const newPlayers = [...state.players]
      const player = newPlayers[playerIndex]

      // Update or add round data
      const roundIndex = player.rounds.findIndex((r) => r.playerId === data.playerId && r.bid === data.bid)
      if (roundIndex >= 0) {
        player.rounds[roundIndex] = data
      } else {
        player.rounds.push(data)
      }

      // Recalculate total score
      player.score = player.rounds.reduce((sum, round) => sum + round.score, 0)

      return { players: newPlayers }
    }),

  resetGame: () => set({ gameMode: null, players: [] }),
}))

