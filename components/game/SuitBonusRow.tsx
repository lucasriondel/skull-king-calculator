import { CardButtonGrid } from "@/components/ui/card-button-grid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  BonusType,
  SUIT_CARDS,
  toggleClass,
  type ExclusiveBonus,
} from "./BonusControls";

interface SuitBonusRowProps {
  playerIndex: number;
  bonuses: Record<number, BonusType>;
  expansion: boolean;
  isVisible: (card: ExclusiveBonus) => boolean;
  onValueChange: (values: string[]) => void;
}

/**
 * The per-suit capture row. Without the expansion it is the original four 14
 * bonuses (+10 +10 +10 +20); with it, each suit gains its 7 and 8:
 *
 *   -5 +5 +10 | -5 +5 +10 | -5 +5 +10 | -5 +5 +20
 *
 * Twelve cells only fit one line on a wide screen, so on mobile the row wraps
 * to two lines of six — a split that keeps each suit's three cells together
 * (green + yellow above, purple + trump below).
 *
 * Every cell is one physical card, so all of them are exclusive across
 * players and the toggles hide once another player claims one.
 */
export function SuitBonusRow({
  playerIndex,
  bonuses,
  expansion,
  isVisible,
  onValueChange,
}: SuitBonusRowProps) {
  const isMobile = useMobile();
  const cards = SUIT_CARDS.filter((card) => expansion || !card.expansionOnly);
  const playerBonuses = bonuses[playerIndex];

  // Wrapping is only needed for the expansion's 12 cells; the plain 4-cell
  // row fits on any screen.
  const columns = expansion && isMobile ? cards.length / 2 : cards.length;
  const lines: typeof cards[] = [];
  for (let i = 0; i < cards.length; i += columns) {
    lines.push(cards.slice(i, i + columns));
  }

  return (
    <ToggleGroup
      type="multiple"
      className="contents"
      value={cards
        .filter((card) => playerBonuses?.[card.field])
        .map((card) => card.value)}
      onValueChange={onValueChange}
    >
      {lines.map((line, lineIndex) => (
        <CardButtonGrid.Row key={lineIndex} columns={columns}>
          {line.map((card, index) => (
            <CardButtonGrid.Cell key={card.value} colIndex={index}>
              <ToggleGroupItem
                value={card.value}
                aria-label={`${card.label} ${card.value}`}
                className={cn(
                  toggleClass,
                  card.textClass,
                  !isVisible(card.value) && "invisible pointer-events-none"
                )}
              >
                {card.label}
              </ToggleGroupItem>
            </CardButtonGrid.Cell>
          ))}
        </CardButtonGrid.Row>
      ))}
    </ToggleGroup>
  );
}
