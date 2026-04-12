import { useMobile } from "@/hooks/use-mobile";
import { CircleDot, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

interface GameHeaderProps {
  gameModeName: string;
  currentRound: number;
  totalRounds: number;
  cardsThisRound: number;
}

export function GameHeader({
  gameModeName,
  currentRound,
  totalRounds,
  cardsThisRound,
}: GameHeaderProps) {
  const t = useTranslations("GamePage");
  const isMobile = useMobile();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/50 border-x min-[673px]:rounded-b-lg">
      <div className="flex items-center gap-2">
        <CircleDot className="h-4 w-4 text-emerald-400" />
        <span className="text-xs uppercase tracking-wider text-slate-400">
          {t("round")}
        </span>
        <span className="text-sm font-semibold text-emerald-400">
          {currentRound}
          <span className="text-slate-500"> / {totalRounds}</span>
        </span>
      </div>

      {!isMobile && (
        <span className="text-xs text-slate-500">{gameModeName}</span>
      )}

      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-purple-400" />
        <span className="text-xs uppercase tracking-wider text-slate-400">
          {t("cardsThisRound")}
        </span>
        <span className="text-sm font-semibold text-purple-400">
          {cardsThisRound}
        </span>
      </div>
    </div>
  );
}
