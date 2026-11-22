import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two columns under one band: a heading block on the left, the content (a list, rows, an accordion) on the right.
 * They stack on a phone, heading first.
 *
 * Hims reference: the "stacked flow" bands of `/benefits.html` (y707, y3865) and `/hair-loss.html` (FAQ, steps):
 * a grid of two equal columns, 616px each at 1440 with a 112px gap (the 1344px content column), heading and one
 * paragraph left, the list right, both starting at the same top edge. The key-line band uses a 670 / 535 split:
 * pass `split="wide-left"` for it.
 *
 * Props: `lead` (the left column: usually a `SectionHeader`-like heading and a paragraph), `children` (right
 * column), `split` ("even" 1 : 1 or "wide-left" 1.25 : 1), `sticky` (keeps the left column in view while a long
 * right column scrolls, desktop only), `className`.
 */
export function StackedFlow({
  lead,
  children,
  split = "even",
  sticky = false,
  className,
}: {
  lead: ReactNode;
  children: ReactNode;
  split?: "even" | "wide-left";
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-8 lg:gap-28",
        split === "even" ? "lg:grid-cols-2" : "lg:grid-cols-[1.25fr_1fr]",
        className,
      )}
    >
      <div className={cn(sticky && "lg:sticky lg:top-24 lg:self-start")}>{lead}</div>
      <div>{children}</div>
    </div>
  );
}
