"use client";

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

function Cell({
  placeholder = false,
  colIndex,
  className,
  children,
  ...props
}: CellProps) {
  const { columns, isLastRow } = React.useContext(RowContext);
  const isFirstCol = colIndex === 0;
  const isLastCol = colIndex === columns - 1;

  return (
    <div
      className={cn(
        "flex items-center justify-center border-t",
        !isFirstCol && "border-l",
        isLastRow && isFirstCol && "rounded-bl-lg",
        isLastRow && isLastCol && "rounded-br-lg",
        placeholder && "pointer-events-none",
        className
      )}
      {...props}
    >
      {!placeholder && children}
    </div>
  );
}

const CardButtonGrid = { Row, Cell };

export { CardButtonGrid };
