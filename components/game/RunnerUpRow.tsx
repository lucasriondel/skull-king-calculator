import { useCountUp } from "@/hooks/use-count-up";

export interface RunnerUpRowProps {
  name: string;
  score: number;
  /** 1-based place shown to the player: 4, 5, … */
  place: number;
  revealed: boolean;
  countUpMs: number;
  animate: boolean;
}

export function RunnerUpRow({
  name,
  score,
  place,
  revealed,
  countUpMs,
  animate,
}: RunnerUpRowProps) {
  const displayScore = useCountUp(score, countUpMs, {
    active: revealed,
    enabled: animate,
  });

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(8px)",
        transition: animate
          ? "opacity 300ms ease-out, transform 300ms cubic-bezier(0.22, 1, 0.36, 1)"
          : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-bold w-6 text-center tabular-nums">
          {place}
        </span>
        <span className="font-medium">{name}</span>
      </div>
      <span className="font-bold tabular-nums">{displayScore}</span>
    </div>
  );
}
