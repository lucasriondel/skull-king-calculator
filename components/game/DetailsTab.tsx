"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGameStore, type RoundData } from "@/lib/store";
import { useTranslations } from "next-intl";

function calculateBaseScore(
  bid: number,
  tricks: number,
  cardsThisRound: number
): number {
  if (bid === 0) {
    return tricks === 0 ? 10 * cardsThisRound : -10 * cardsThisRound;
  } else {
    return bid === tricks ? 20 * bid : -10 * Math.abs(bid - tricks);
  }
}

function calculateBonusScore(bonuses: RoundData["bonuses"]): number {
  if (!bonuses) {
    return 0;
  }

  let bonusScore = 0;
  if (bonuses.greenBonus) bonusScore += 10;
  if (bonuses.yellowBonus) bonusScore += 10;
  if (bonuses.purpleBonus) bonusScore += 10;
  if (bonuses.darkBonus) bonusScore += 20;
  if (bonuses.treasure) bonusScore += bonuses.treasure * 20;
  if (bonuses.mermaid) bonusScore += bonuses.mermaid * 20;
  if (bonuses.pirate) bonusScore += bonuses.pirate * 30;
  if (bonuses.skullKing) bonusScore += 40;

  return bonusScore;
}

export function DetailsTab() {
  const { players, gameMode } = useGameStore();
  const t = useTranslations("GamePage.DetailsTab");

  if (!gameMode) {
    return null;
  }

  const rounds = Array.from({ length: gameMode.rounds }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {rounds.map((roundNumber) => {
        const roundDataForThisRound = players.map((player) => {
          const roundData = player.rounds[roundNumber - 1];
          return { player, roundData };
        });

        if (
          !roundDataForThisRound.some((data) => data.roundData !== undefined)
        ) {
          return null;
        }

        return (
          <div key={roundNumber}>
            <h3 className="text-lg font-semibold">
              {t("round")} {roundNumber}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("player")}</TableHead>
                  <TableHead>{t("bid")}</TableHead>
                  <TableHead>{t("bonusPoints")}</TableHead>
                  <TableHead>{t("newScore")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roundDataForThisRound.map(({ player, roundData }) => {
                  if (!roundData) {
                    return (
                      <TableRow key={player.name}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell colSpan={3} className="text-center">
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const baseScore = calculateBaseScore(
                    roundData.bid,
                    roundData.tricks,
                    roundData.cardsThisRound || 0
                  );
                  const bonusScore =
                    baseScore > 0 ? calculateBonusScore(roundData.bonuses) : 0;
                  const roundScore = baseScore + bonusScore;

                  const previousRounds = player.rounds.slice(
                    0,
                    roundNumber - 1
                  );
                  const scoreBeforeThisRound = previousRounds.reduce(
                    (acc, round) => acc + round.score,
                    0
                  );
                  const newScore = scoreBeforeThisRound + roundScore;

                  return (
                    <TableRow key={player.name}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {roundData.bid} / {roundData.tricks}
                          </span>
                          <Badge
                            variant={baseScore >= 0 ? "success" : "destructive"}
                          >
                            {baseScore >= 0 ? "+" : ""}
                            {baseScore}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer"
                            >
                              {bonusScore}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Bonus Details
                              </h4>
                              <ul className="text-sm text-muted-foreground">
                                {roundData.bonuses?.greenBonus && (
                                  <li>Green Bonus: +10</li>
                                )}
                                {roundData.bonuses?.yellowBonus && (
                                  <li>Yellow Bonus: +10</li>
                                )}
                                {roundData.bonuses?.purpleBonus && (
                                  <li>Purple Bonus: +10</li>
                                )}
                                {roundData.bonuses?.darkBonus && (
                                  <li>Black Bonus: +20</li>
                                )}
                                {(roundData.bonuses?.treasure ?? 0 > 0) && (
                                  <li>
                                    Treasure: {roundData.bonuses?.treasure} x 20
                                    = {(roundData.bonuses?.treasure ?? 0) * 20}
                                  </li>
                                )}
                                {(roundData.bonuses?.mermaid ?? 0 > 0) && (
                                  <li>
                                    Mermaid: {roundData.bonuses?.mermaid} x 20 ={" "}
                                    {(roundData.bonuses?.mermaid ?? 0) * 20}
                                  </li>
                                )}
                                {(roundData.bonuses?.pirate ?? 0 > 0) && (
                                  <li>
                                    Pirate: {roundData.bonuses?.pirate} x 30 ={" "}
                                    {(roundData.bonuses?.pirate ?? 0) * 30}
                                  </li>
                                )}
                                {roundData.bonuses?.skullKing && (
                                  <li>Skull King: +40</li>
                                )}
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{newScore}</span>
                          <Badge
                            variant={
                              roundScore >= 0 ? "success" : "destructive"
                            }
                          >
                            {roundScore >= 0 ? "+" : ""}
                            {roundScore}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
