import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PriceRow = { label: ReactNode; price: ReactNode };

/**
 * A price list drawn as hairline rows: the item on the left, its price on the right. For fee schedules and
 * "what it costs" tables where the rows are many and short.
 *
 * Hims reference: the item rows of `/labs/biomarkers.html` (y1501, 1440 wide), which are plain rows with no card:
 * 18px vertical padding, 20px between label and the right-hand part, a 1px divider rgba(0,0,0,.12) under every
 * row (our `border-border`), label 15.67px / 500 (ours `text-label`). The price takes the place of the chevron,
 * in the same weight but bolder (`font-semibold`, tabular numerals) so a column of prices lines up.
 *
 * It is a definition list (`dl`): each row is an item (`dt`) and its price (`dd`), so a screen reader reads them
 * as pairs. Rows are not headings.
 *
 * Props: `rows` (`{ label, price }`), `className`.
 */
export function PriceList({ rows, className }: { rows: readonly PriceRow[]; className?: string }) {
  return (
    <dl className={cn("m-0", className)}>
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex items-baseline justify-between gap-6 border-b border-border py-[18px]"
        >
          <dt className="text-label">{row.label}</dt>
          <dd className="m-0 shrink-0 text-right text-label font-semibold tabular-nums">
            {row.price}
          </dd>
        </div>
      ))}
    </dl>
  );
}
