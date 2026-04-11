import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const numberSelectorVariants = cva(
  "flex items-center justify-center h-10 cursor-pointer border-l border-t transition-colors",
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
}

export function NumberSelector({
  length,
  selected,
  onSelect,
  highlightNumber,
}: NumberSelectorProps) {
  const numbers = Array.from({ length }, (_, i) => i);
  const columns = Math.min(length, 6);

  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {numbers.map((num) => (
        <div
          key={num}
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
        </div>
      ))}
    </div>
  );
}
