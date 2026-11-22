import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CheckItem = { text: ReactNode; included?: boolean };

const DISC = { rust: "fill-rust", gold: "fill-gold", ink: "fill-black" } as const;
const TICK = { rust: "stroke-white", gold: "stroke-brown", ink: "stroke-white" } as const;

/**
 * Hims icon list: a short run of facts or plan perks, each with a round tick on the left.
 *
 * Hims reference: `/hair-loss.html` hero (y117, 1440 wide) and `/weight-loss/membership.html` split bands.
 * Measured: `ul` as a grid with a 20px row gap; each item is a grid of an 18px icon, a 10px gap and the text
 * (15.67px / 400 / 20px at 50% black; we use `text-body text-muted` for 4.5:1 contrast). The icon is an 18px
 * circle filled `#8a3a34` (our `rust`) with a white tick. The first text line sits level with the icon.
 *
 * An item with `included: false` shows a quiet empty circle and adds a screen-reader note, for plan lists where
 * a perk is not part of the plan. Items are plain list rows, never headings.
 *
 * Props: `items` (a string, or `{ text, included }`), `tone` (the disc colour: rust, gold or ink), `text`
 * (the text colour: muted like Hims, or fg for a plan list that has to read clearly), `className`.
 */
export function CheckList({
  items,
  tone = "rust",
  text = "muted",
  className,
}: {
  items: readonly (string | CheckItem)[];
  tone?: keyof typeof DISC;
  text?: "muted" | "fg";
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-5", className)}>
      {items.map((item, index) => {
        const entry: CheckItem = typeof item === "string" ? { text: item } : item;
        const included = entry.included !== false;
        return (
          <li key={index} className="grid grid-cols-[18px_1fr] items-start gap-x-2.5">
            <svg aria-hidden viewBox="0 0 18 18" className="mt-[1px] size-[18px] shrink-0">
              {included ? (
                <>
                  <circle cx="9" cy="9" r="9" className={DISC[tone]} />
                  <path
                    d="M5.2 9.3 7.8 11.9 12.8 6.5"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={TICK[tone]}
                  />
                </>
              ) : (
                <>
                  <circle
                    cx="9"
                    cy="9"
                    r="8.25"
                    fill="none"
                    strokeWidth="1.5"
                    className="stroke-border-strong"
                  />
                  <path
                    d="M5.8 9h6.4"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="stroke-border-strong"
                  />
                </>
              )}
            </svg>
            <span
              className={cn(
                "text-body",
                included ? (text === "fg" ? "text-fg" : "text-muted") : "text-subtle",
              )}
            >
              {entry.text}
              {included ? null : <span className="sr-only"> (not included)</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
