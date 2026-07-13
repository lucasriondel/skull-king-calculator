import * as React from "react";
import { cn } from "@/lib/utils";

interface RowContextValue {
  columns: number;
  isLastRow: boolean;
}

const RowContext = React.createContext<RowContextValue>({
  columns: 4,
  isLastRow: false,
});

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: number;
  isLastRow?: boolean;
}

function Row({
  columns,
  isLastRow = false,
  className,
  children,
  ...props
}: RowProps) {
  const ctx = React.useMemo(
    () => ({ columns, isLastRow }),
    [columns, isLastRow]
  );

  return (
    <RowContext.Provider value={ctx}>
      <div
        className={cn("grid w-full", className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
        {...props}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
}

interface CellProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: boolean;
  colIndex: number;
}

/**
 * Activate an interactive grid cell from the keyboard. Grid cells expose
 * `role="button"`, so — like a native button — Enter and Space must trigger
 * the click handler, and Space must not scroll the page (issue #10).
 */
export function handleCellKeyDown(
  event: React.KeyboardEvent<HTMLDivElement>,
  onClick?: React.MouseEventHandler<HTMLDivElement>
) {
  if (!onClick) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
  }
}

function Cell({
  placeholder = false,
  colIndex,
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: CellProps) {
  const { columns, isLastRow } = React.useContext(RowContext);
  const isFirstCol = colIndex === 0;
  const isLastCol = colIndex === columns - 1;
  const isInteractive = !placeholder && onClick != null;

  return (
    <div
      className={cn(
        "flex items-center justify-center border-t",
        !isFirstCol && "border-l",
        isLastRow && isFirstCol && "rounded-bl-lg",
        isLastRow && isLastCol && "rounded-br-lg",
        placeholder && "pointer-events-none",
        isInteractive &&
          "focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={placeholder ? undefined : onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (isInteractive) handleCellKeyDown(event, onClick);
      }}
      {...props}
    >
      {!placeholder && children}
    </div>
  );
}

const CardButtonGrid = { Row, Cell };

export { CardButtonGrid };
