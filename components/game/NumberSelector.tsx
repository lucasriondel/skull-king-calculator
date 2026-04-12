import { CardButtonGrid } from "@/components/ui/card-button-grid";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const numberSelectorVariants = cva(
  "h-14 w-full cursor-pointer transition-colors",
  {
    variants: {
      state: {
        default: "bg-background hover:bg-accent",
        selected: "bg-primary text-primary-foreground",
        highlighted:
          "bg-background hover:bg-accent ring-2 ring-inset ring-yellow-500",
        selectedHighlighted:
          "bg-yellow-500 text-primary-foreground ring-2 ring-inset ring-yellow-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

interface NumberSelectorProps
  extends VariantProps<typeof numberSelectorVariants> {
  length: number;
  selected: number | undefined;
  onSelect: (num: number) => void;
  highlightNumber?: number;
  isLastSection?: boolean;
}

export function NumberSelector({
  length,
  selected,
  onSelect,
  highlightNumber,
  isLastSection = false,
}: NumberSelectorProps) {
  const numbers = Array.from({ length }, (_, i) => i);
  const columns = Math.min(length, 6);
  const totalRows = Math.ceil(length / columns);

  const rowChunks: number[][] = [];
  for (let r = 0; r < totalRows; r++) {
    rowChunks.push(numbers.slice(r * columns, (r + 1) * columns));
  }

  return (
    <>
      {rowChunks.map((chunk, rowIndex) => {
        const isLast = isLastSection && rowIndex === rowChunks.length - 1;
        const padding = columns - chunk.length;

        return (
          <CardButtonGrid.Row
            key={rowIndex}
            columns={columns}
            isLastRow={isLast}
          >
            {chunk.map((num) => (
              <CardButtonGrid.Cell
                key={num}
                colIndex={num % columns}
                onClick={() => onSelect(num)}
                className={cn(
                  numberSelectorVariants({
                    state:
                      selected === num && num === highlightNumber
                        ? "selectedHighlighted"
                        : selected === num
                        ? "selected"
                        : num === highlightNumber
                        ? "highlighted"
                        : "default",
                  })
                )}
              >
                {num}
              </CardButtonGrid.Cell>
            ))}
            {Array.from({ length: padding }, (_, i) => (
              <CardButtonGrid.Cell
                key={`pad-${i}`}
                colIndex={chunk.length + i}
                placeholder
                className="h-14"
              />
            ))}
          </CardButtonGrid.Row>
        );
      })}
    </>
  );
}
