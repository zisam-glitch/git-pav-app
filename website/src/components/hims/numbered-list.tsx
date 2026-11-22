import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NumberedItem = { title: ReactNode; children?: ReactNode };

const SIZES = {
  sm: {
    gap: "gap-5",
    badge: "size-[18px] text-[11px] font-bold",
    title: "text-label",
    text: "text-small",
  },
  md: {
    gap: "gap-6",
    badge: "size-8 text-small font-medium",
    title: "text-h4",
    text: "text-body",
  },
  /** Items that are one sentence each: body-size text beside a 28px badge. */
  text: {
    gap: "gap-4",
    badge: "size-7 text-small font-medium",
    title: "text-body",
    text: "text-small",
  },
} as const;

/**
 * A numbered list: a small round number, a title and a line of text for each step.
 *
 * Hims reference: "How ... works" on `/benefits.html` (band y3046, right leaf): `ul` grid with a 20px row gap;
 * each item is a grid of the number badge and a text column with a 10px gap (text column: 4px between title and
 * text); badge 18x18 circle, fill `#ad6657`, white 11px / 700; title 15.67px / 500 at 81% black, text 15.67px at
 * 50% black. `size="md"` is our larger version for sentences (32px badge, `text-h4` title, `text-body` text).
 * The badge uses `terracotta` (white text on it passes 4.5:1).
 *
 * Props: `items` (`{ title, children }`), `size` ("sm" is the Hims size, "md" default, "text" for one-sentence items),
 * `className`. The numbers are real text so they read out; the list is an `ol`. token-request: the Hims 11px / 700
 * number (`text-[11px]`) has no type class.
 */
export function NumberedList({
  items,
  size = "md",
  className,
}: {
  items: readonly NumberedItem[];
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const look = SIZES[size];
  return (
    <ol role="list" className={cn("grid", look.gap, className)}>
      {items.map((item, index) => (
        <li key={index} className="grid grid-cols-[auto_1fr] items-start gap-x-3">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-terracotta text-white",
              look.badge,
            )}
          >
            {index + 1}
          </span>
          <div>
            <p className={cn(look.title, "text-fg")}>{item.title}</p>
            {item.children ? (
              <p className={cn("mt-1", look.text, "text-muted")}>{item.children}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
