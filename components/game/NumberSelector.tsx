import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const numberSelectorVariants = cva(
  "flex items-center justify-center w-12 h-12 rounded-full cursor-pointer border transition-colors",
  {
    variants: {
      state: {
        default: "bg-background hover:bg-accent border-input",
        selected: "bg-primary text-primary-foreground border-primary",
        highlighted:
          "bg-background hover:bg-accent border-input ring-2 ring-yellow-500",
        selectedHighlighted:
          "bg-yellow-500 text-primary-foreground border-yellow-500 ring-2 ring-yellow-500",
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
  const isMobile = useMobile();
  const rowSize = isMobile ? 6 : 11;

  const numbers = Array.from({ length }, (_, i) => i);

  return (
    <div
      className="p-1 grid gap-1 w-fit mx-auto"
      style={{ gridTemplateColumns: `repeat(${rowSize}, minmax(0, 48px))` }}
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
