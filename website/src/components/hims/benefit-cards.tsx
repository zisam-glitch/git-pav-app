import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Media } from "./media";
import { Section, type SectionTheme } from "./section";
import { SectionHeader } from "./section-header";
import type { AccentTone } from "./tones";

export type BenefitItem = {
  title: ReactNode;
  body: ReactNode;
  /** A picture for the top of the card. Without one the card shows `icon` (or nothing). */
  media?: {
    src?: string;
    alt: string;
    tone?: "cream" | "sage" | "sand" | "brown" | "navy" | "clay";
  };
  icon?: LucideIcon;
};

const GRID = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * A row of benefit or step cards, each with a square picture, a title and a short paragraph.
 *
 * Hims reference: "GLP-1 power in a pill" on `/weight-loss/wegovy-pill.html` (y920, 1440 wide): header row with
 * the heading on the left (44.67px / 418) and one pill on the right; cards 438x534 on a 15px grid, warm sand fill
 * (#f0e5d2), 16px radius, 25px padding, 20px between parts; a 388px square picture (10px radius), title
 * 22.17px/500, text 15.67px/400 at 50% black. On a phone (390px): cards 314px wide (peeking, 12px apart),
 * 20px padding, 274px picture, title 18px, text 14px. `variant="plain"` is the "How to apply" band of
 * `/hair-loss/minoxidil.html` (y2723): no fill and no padding, a 438px square picture (16px radius), the same
 * title and text.
 *
 * Props: `title` + `accent` (the one H2), `tone`, `lead`, `action`, `items` (`BenefitItem`: `title`, `body`,
 * `media`, `icon`), `variant` ("card" default, or "plain"), `columns` (2, 3 or 4 on a desktop; a phone scrolls
 * sideways), `numbered` (adds 01, 02 ... above each card), `theme`, `id`. Card titles are H3.
 */
export function BenefitCards({
  id,
  theme = "white",
  title,
  accent,
  tone = "terracotta",
  lead,
  action,
  items,
  variant = "card",
  columns = 3,
  numbered = false,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  action?: ReactNode;
  items: readonly BenefitItem[];
  variant?: "card" | "plain";
  columns?: 2 | 3 | 4;
  numbered?: boolean;
}) {
  const card = variant === "card";
  return (
    <Section id={id} theme={theme}>
      <SectionHeader
        title={title}
        accent={accent}
        tone={tone}
        lead={lead}
        action={action}
        size="h3"
      />
      <ul
        className={cn(
          "no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-14 md:grid md:gap-4 md:overflow-visible md:px-0 md:pb-0",
          GRID[columns],
        )}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={index} className="w-[80%] shrink-0 snap-start sm:w-[60%] md:w-auto">
              <article
                className={cn(
                  "flex h-full flex-col gap-4 md:gap-5",
                  card && "rounded-md bg-sand p-5 md:p-[25px]",
                )}
              >
                {numbered ? (
                  <p className="text-label tabular-nums text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                ) : null}
                {item.media ? (
                  <Media
                    src={item.media.src}
                    alt={item.media.alt}
                    ratio="1 / 1"
                    tone={item.media.tone ?? (card ? "cream" : "sand")}
                    className={card ? "rounded-[0.625rem]" : "rounded-md"}
                  />
                ) : Icon ? (
                  <span
                    aria-hidden
                    className="grid size-10 place-items-center rounded-full bg-white text-terracotta"
                  >
                    <Icon className="size-4" />
                  </span>
                ) : null}
                {/* token-request: text-card-title (Hims 22.17px/500, 18px on a phone) */}
                <h3 className="text-[1.125rem] leading-[1.16] font-medium md:text-[1.385rem]">
                  {item.title}
                </h3>
                <p className="text-body text-muted">{item.body}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
