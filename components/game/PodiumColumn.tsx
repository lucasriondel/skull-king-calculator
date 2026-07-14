import { Trophy } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

export interface PodiumColumnProps {
  name: string;
  score: number;
  /** 0-based finishing rank: 0 = winner. */
  rankIdx: number;
  /** Whether this column has been revealed yet by the sequencer. */
  revealed: boolean;
  /** How long the score spends counting up. */
  countUpMs: number;
  /** False under reduced motion: bar is full height, score is final, instantly. */
  animate: boolean;
}

const PODIUM_COLORS = [
  { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-400" },
  { bg: "bg-gray-300", text: "text-black", border: "border-gray-300" },
  { bg: "bg-amber-700", text: "text-white", border: "border-amber-600" },
];

// Bar height per rank. Fixed px (not Tailwind h-*) so the growth transition has
// a concrete value to interpolate toward.
const PODIUM_HEIGHTS_PX = [112, 80, 56];

export function PodiumColumn({
  name,
  score,
  rankIdx,
  revealed,
  countUpMs,
  animate,
}: PodiumColumnProps) {
  const colors = PODIUM_COLORS[rankIdx];
  const fullHeight = PODIUM_HEIGHTS_PX[rankIdx];
  const displayScore = useCountUp(score, countUpMs, {
    active: revealed,
    enabled: animate,
  });

  return (
    <div className="flex flex-col items-center flex-1 max-w-[130px]">
      <div
        className="flex flex-col items-center mb-2 transition-opacity duration-300"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        {rankIdx === 0 && <Trophy className="w-5 h-5 text-yellow-500 mb-1" />}
        <span className="text-sm font-semibold truncate max-w-[100px] text-center">
          {name}
        </span>
        <span className="text-xs text-muted-foreground font-bold tabular-nums">
          {displayScore}
        </span>
      </div>
      <div
        className={`w-full ${colors.bg} rounded-t-lg flex items-center justify-center border-2 ${colors.border} border-b-0 overflow-hidden`}
        style={{
          height: revealed ? fullHeight : 0,
          // Grows upward from the baseline; ease-out so it settles rather than stops.
          transition: animate
            ? "height 600ms cubic-bezier(0.22, 1, 0.36, 1)"
            : undefined,
        }}
      >
        <span className={`text-2xl font-black ${colors.text}`}>
          {rankIdx + 1}
        </span>
      </div>
    </div>
  );
}
