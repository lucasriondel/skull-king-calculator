import { Crown, CircleEllipsis } from "lucide-react";
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

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <div className="w-full sm:w-auto">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg px-4 py-3 shadow-md">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-white/20 rounded-full transform rotate-12"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1.5">
                <Crown className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                {t("gameMode")}
              </div>
              <div className="text-xl font-bold truncate">{gameModeName}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg px-4 py-3 shadow-md">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-white/20 rounded-full transform -rotate-12"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1.5">
                <CircleEllipsis className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                {t("round")}
              </div>
              <div className="text-xl font-bold">
                {currentRound}{" "}
                <span className="text-sm opacity-80">
                  {t("of")} {totalRounds}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <div className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-4 py-3 shadow-md">
          <div className="mr-3 relative">
            <div className="absolute inset-0 bg-white/20 rounded-md transform rotate-6"></div>
            <div className="absolute inset-0 bg-white/20 rounded-md transform -rotate-3"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-md p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-square-stack"
              >
                <path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path>
                <path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"></path>
                <rect width="8" height="8" x="14" y="14" rx="2"></rect>
              </svg>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">
              {t("cardsThisRound")}
            </div>
            <div className="text-xl font-bold">{cardsThisRound}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
