import { useCountUp } from "@/hooks/use-count-up";
import { ScoreRow } from "@/components/game/ScoreRow";

export interface RunnerUpRowProps {
  name: string;
  score: number;
  /** 1-based place shown to the player: 4, 5, … */
  place: number;
  /** Index of the player in the game's player list — drives their color. */
  colorIndex: number;
  revealed: boolean;
  countUpMs: number;
  animate: boolean;
}

export function RunnerUpRow({
  name,
  score,
  place,
  colorIndex,
  revealed,
  countUpMs,
  animate,
}: RunnerUpRowProps) {
  const displayScore = useCountUp(score, countUpMs, {
    active: revealed,
    enabled: animate,
  });

  return (
    <ScoreRow
      name={name}
      place={place}
      colorIndex={colorIndex}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(8px)",
        transition: animate
          ? "opacity 300ms ease-out, transform 300ms cubic-bezier(0.22, 1, 0.36, 1)"
          : undefined,
      }}
    >
      {displayScore}
    </ScoreRow>
  );
}
