import { useMobile } from "@/hooks/use-mobile";

interface NumberSelectorProps {
  length: number;
  selected: number | undefined;
  onSelect: (num: number) => void;
}

export function NumberSelector({
  length,
  selected,
  onSelect,
}: NumberSelectorProps) {
  const isMobile = useMobile();
  const rowSize = isMobile ? 6 : 11;

  const numbers = Array.from({ length }, (_, i) => i);

  return (
    <div
      className="grid gap-1 w-fit mx-auto"
      style={{ gridTemplateColumns: `repeat(${rowSize}, minmax(0, 48px))` }}
    >
      {numbers.map((num) => (
        <div
          key={num}
          onClick={() => onSelect(num)}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full cursor-pointer
            border transition-colors
            ${
              selected === num
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-input"
            }
          `}
        >
          {num}
        </div>
      ))}
    </div>
  );
}
