import { PodiumColumn } from "@/components/game/PodiumColumn";

interface Player {
  name: string;
  score: number;
  /**
   * Index of the player in the game's player list. The podium is sorted by
   * score, so this has to be carried in from the unsorted list — see
   * `withPlayerColorIndex` in `lib/player-colors.ts`.
   */
  colorIndex: number;
}

export interface PodiumProps {
  players: Player[];
  /**
   * How many podium places have been revealed, counted 3rd → 2nd → 1st.
   * Defaults to all three: the mid-game scoreboard shows standings outright,
   * only the game-complete screen sequences them.
   */
  revealedCount?: number;
  /** How long each score spends counting up. */
  countUpMs?: number;
  /** False under reduced motion, or wherever the reveal shouldn't animate. */
  animate?: boolean;
}

// Visual left-to-right arrangement is 2nd, 1st, 3rd — the classic podium shape.
// Reveal order is the reverse of finishing order (3rd first, winner last), so the
// two are tracked separately: `rankIdx` drives looks, `revealStep` drives timing.
const LAYOUTS: Record<number, number[]> = {
  1: [0],
  2: [1, 0],
  3: [1, 0, 2],
};

export function Podium({
  players,
  revealedCount = 3,
  countUpMs = 0,
  animate = false,
}: PodiumProps) {
  const top3 = players.slice(0, 3);
  const layout = LAYOUTS[top3.length] ?? [];

  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {layout.map((rankIdx) => {
        const player = top3[rankIdx];
        if (!player) return null;

        // Last place on the podium reveals first, winner last.
        const revealStep = top3.length - 1 - rankIdx;

        return (
          <PodiumColumn
            key={player.name}
            name={player.name}
            score={player.score}
            rankIdx={rankIdx}
            colorIndex={player.colorIndex}
            revealed={revealedCount > revealStep}
            countUpMs={countUpMs}
            animate={animate}
          />
        );
      })}
    </div>
  );
}
