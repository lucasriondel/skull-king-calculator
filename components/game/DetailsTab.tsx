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
import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, ReactNode } from "react";

function numberToEmoji(number: number, emoji: string): ReactNode {
  return (
    <>
      {Array.from({ length: number }, (_, i) => (
        <Fragment key={i}>{emoji}</Fragment>
      ))}
    </>
  );
}

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

function calculateBonusScore(
  bonuses: RoundData["bonuses"],
  effectiveTreasureCount: number
): number {
  if (!bonuses) {
    return 0;
  }

  let bonusScore = 0;
  if (bonuses.greenBonus) bonusScore += 10;
  if (bonuses.yellowBonus) bonusScore += 10;
  if (bonuses.purpleBonus) bonusScore += 10;
  if (bonuses.darkBonus) bonusScore += 20;
  bonusScore += effectiveTreasureCount * 20;
  if (bonuses.mermaid) bonusScore += bonuses.mermaid * 20;
  if (bonuses.pirate) bonusScore += bonuses.pirate * 30;
  if (bonuses.skullKing) bonusScore += 40;

  return bonusScore;
}

function getEffectiveTreasureCount(
  bonuses: RoundData["bonuses"],
  allRoundData: (RoundData | undefined)[]
): number {
  if (!bonuses?.treasureGroups?.length) {
    return bonuses?.treasure ?? 0;
  }
  let count = 0;
  for (const group of bonuses.treasureGroups) {
    const everyoneMet = group.playerIndexes.every((i) => {
      const data = allRoundData[i];
      return data !== undefined && data.bid === data.tricks;
    });
    if (everyoneMet) count += group.treasureCount;
  }
  return count;
}

export function DetailsTab() {
  const { players, gameMode } = useGameStore();
  const t = useTranslations("GamePage.DetailsTab");

  if (!gameMode) {
    return null;
  }

  const rounds = Array.from({ length: gameMode.rounds }, (_, i) => i + 1);

  const hasAnyData = players.some((player) =>
    player.rounds.some((r) => r !== undefined)
  );

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <ClipboardList className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-sm">{t("emptyState")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((roundNumber) => {
        const roundDataForThisRound = players.map((player, playerIndex) => {
          const roundData = player.rounds[roundNumber - 1];
          return { player, playerIndex, roundData };
        });
        const allRoundDataForThisRound = roundDataForThisRound.map(
          (d) => d.roundData
        );

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
                {roundDataForThisRound.map(({ player, playerIndex, roundData }) => {
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
                    roundData.tricks ?? 0,
                    roundData.cardsThisRound || 0
                  );
                  const effectiveTreasureCount = getEffectiveTreasureCount(
                    roundData.bonuses,
                    allRoundDataForThisRound
                  );
                  const potentialBonusScore = calculateBonusScore(
                    roundData.bonuses,
                    effectiveTreasureCount
                  );
                  const bonusScore = baseScore > 0 ? potentialBonusScore : 0;
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

                  const bonusPointsBadge = (
                    <Badge
                      variant={baseScore > 0 ? "success" : "destructive"}
                      className="cursor-pointer"
                    >
                      {potentialBonusScore}
                    </Badge>
                  );

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
                        {potentialBonusScore > 0 ? (
                          <Popover>
                            <PopoverTrigger
                              asChild
                              disabled={potentialBonusScore <= 0}
                            >
                              {bonusPointsBadge}
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                  Bonus Details
                                </h4>
                                <ul className="text-sm text-muted-foreground">
                                  {roundData.bonuses?.greenBonus ? (
                                    <li className="text-green-500">+10</li>
                                  ) : null}
                                  {roundData.bonuses?.yellowBonus ? (
                                    <li className="text-yellow-500">+10</li>
                                  ) : null}
                                  {roundData.bonuses?.purpleBonus ? (
                                    <li className="text-purple-500">+10</li>
                                  ) : null}
                                  {roundData.bonuses?.darkBonus ? (
                                    <li className="text-black">+20</li>
                                  ) : null}
                                  {roundData.bonuses?.treasureGroups?.length
                                    ? roundData.bonuses.treasureGroups.map(
                                        (group) => {
                                          const partners = group.playerIndexes
                                            .filter((i) => i !== playerIndex)
                                            .map((i) => players[i]?.name)
                                            .filter(Boolean)
                                            .join(", ");
                                          const allianceMet =
                                            group.playerIndexes.every((i) => {
                                              const data =
                                                allRoundDataForThisRound[i];
                                              return (
                                                data !== undefined &&
                                                data.bid === data.tricks
                                              );
                                            });
                                          const points =
                                            group.treasureCount * 20;
                                          return (
                                            <li
                                              key={group.id}
                                              className={
                                                allianceMet
                                                  ? ""
                                                  : "line-through opacity-60"
                                              }
                                            >
                                              {numberToEmoji(
                                                group.treasureCount,
                                                "💰"
                                              )}{" "}
                                              {partners
                                                ? `👥 ${partners}`
                                                : ""}{" "}
                                              {allianceMet
                                                ? `+${points}`
                                                : `+0`}
                                            </li>
                                          );
                                        }
                                      )
                                    : (roundData.bonuses?.treasure ?? 0) > 0
                                      ? (
                                          <li>
                                            {numberToEmoji(
                                              roundData.bonuses?.treasure ?? 0,
                                              "💰"
                                            )}{" "}
                                            x 20 ={" "}
                                            {(roundData.bonuses?.treasure ?? 0) *
                                              20}
                                          </li>
                                        )
                                      : null}
                                  {(roundData.bonuses?.mermaid ?? 0) > 0 ? (
                                    <li>
                                      {numberToEmoji(
                                        roundData.bonuses?.mermaid ?? 0,
                                        "🧜‍♀️"
                                      )}{" "}
                                      x 20 ={" "}
                                      {(roundData.bonuses?.mermaid ?? 0) * 20}
                                    </li>
                                  ) : null}
                                  {(roundData.bonuses?.pirate ?? 0 > 0) ? (
                                    <li>
                                      {numberToEmoji(
                                        roundData.bonuses?.pirate ?? 0,
                                        "🏴‍☠️"
                                      )}{" "}
                                      x 30 ={" "}
                                      {(roundData.bonuses?.pirate ?? 0) * 30}
                                    </li>
                                  ) : null}
                                  {roundData.bonuses?.skullKing ? (
                                    <li>💀👑 +40</li>
                                  ) : null}
                                </ul>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          bonusPointsBadge
                        )}
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
