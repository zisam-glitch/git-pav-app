import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TitleCard = {
  title: ReactNode;
  /** Optional line under the title (live wording only). */
  body?: ReactNode;
  icon?: LucideIcon;
};

const GRID = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * A grid of short soft cards: a round icon, a title and, when the live page has one, a line of text. For lists
 * of options or reasons where each point is a short name ("Full Dentures", "Fast turnaround").
 *
 * Hims reference: the card bands of `/hair-loss/minoxidil.html` ("How to apply", y2723) and the soft row cards
 * of `/benefits.html` (y707). Measured: `li` fill rgba(0,0,0,.03) (about #f7f7f7 on white), radius 16px, padding
 * 25px (20px on a phone), 20px between parts, 15px gaps; title 22.17px / 500 / 1.16 (18px on a phone); text
 * 15.67px at 50% black. `tone="dark"` is the same card on a brown or navy band (fill white at 7%, white text).
 * Static: no hover (the cards are not links).
 *
 * Props: `items` (`{ title, body, icon }`; titles are H3, so put the grid under a section that has an H2),
 * `columns` (2, 3 or 4 from a desktop; two across from a tablet, one on a phone), `tone` ("light" or "dark"),
 * `className`.
 */
export function TitleCards({
  items,
  columns = 4,
  tone = "light",
  className,
}: {
  items: readonly TitleCard[];
  columns?: 2 | 3 | 4;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <ul className={cn("grid gap-3 md:gap-[15px]", GRID[columns], className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <li key={index}>
            <article
              className={cn(
                "flex h-full flex-col gap-4 rounded-md p-5 md:gap-5 md:p-[25px]",
                dark ? "bg-white/7 text-white" : "bg-black/3 text-fg",
              )}
            >
              {Icon ? (
                <span
                  aria-hidden
                  className={cn(
                    "grid size-10 place-items-center rounded-full",
                    dark ? "bg-white/10 text-gold" : "bg-white text-terracotta",
                  )}
                >
                  <Icon className="size-4" />
                </span>
              ) : null}
              {/* token-request: text-card-title (Hims 22.17px/500, 18px on a phone) */}
              <h3 className="text-[1.125rem] leading-[1.16] font-medium md:text-[1.385rem]">
                {item.title}
              </h3>
              {item.body ? (
                <p className={cn("text-body", dark ? "text-white/80" : "text-muted")}>
                  {item.body}
                </p>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
