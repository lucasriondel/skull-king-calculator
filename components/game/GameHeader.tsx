import { useMobile } from "@/hooks/use-mobile";
import { CircleDot, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("translation", { keyPrefix: "GamePage" });
  const isMobile = useMobile();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border border-x min-[673px]:rounded-b-lg md:rounded-b-none min-[1025px]:rounded-b-lg">
      <div className="flex items-center gap-2">
        <CircleDot className="h-4 w-4 text-emerald-500" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("round")}
        </span>
        <span className="text-sm font-semibold text-emerald-500 tabular-nums">
          {currentRound}
          <span className="text-muted-foreground"> / {totalRounds}</span>
        </span>
      </div>

      {!isMobile && (
        <span className="text-xs text-muted-foreground">{gameModeName}</span>
      )}

      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-purple-500" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("cardsThisRound")}
        </span>
        <span className="text-sm font-semibold text-purple-500 tabular-nums">
          {cardsThisRound}
        </span>
      </div>
    </div>
  );
}
