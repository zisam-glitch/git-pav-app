import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Media } from "./media";
import { Section, type SectionTheme } from "./section";
import { SectionHeader } from "./section-header";
import type { AccentTone } from "./tones";

export type OptionBadge = { text: string; tone?: "butter" | "glass" };
export type OptionTile = {
  id: string;
  /** Short name of the option. Not a heading: the detail section further down holds the heading. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** The live price, for example "£65". */
  price?: ReactNode;
  badges?: readonly OptionBadge[];
  media?: { src?: string; alt: string };
  /** Where the tile goes: an on-page anchor such as "#whitening-strips". */
  href: string;
};

/**
 * Dark tiles that put a page's treatment options (ranges, tiers, kits) side by side: the first tile is the big
 * one, the others sit beside it. Each tile is one link.
 *
 * Hims reference: "Testosterone treatments through Hims" on `/testosterone.html` (y1056, 1440 wide): a centred
 * 52.83px heading; tiles in a 5px grid (758x779 big tile beside four 250x387 tiles), deep teal (#0a2633), 28px
 * radius, 16.5/18.5px padding; a badge row (pills, 4/10px padding, 12.83px/490: butter fill for "New", 14% white
 * for the rest); title 37.5px/436 on the big tile and 22px/473 on the small ones, white at 94%; subtitle 12.83px at
 * 71% white; the picture below; a 38px round arrow (14% white) at the bottom right. On a phone (390px) the big tile
 * is full width and the small ones sit two across, 4px apart, 24px radius.
 *
 * Props: `title` + `accent` (the one H2), `tone`, `lead`, `action` (a button node under the heading),
 * `items` (2 to 5 `OptionTile`s; three is the usual Pav case), `theme`, `id`.
 */
export function OptionTiles({
  id,
  theme = "white",
  title,
  accent,
  tone = "terracotta",
  lead,
  action,
  items,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  action?: ReactNode;
  items: readonly OptionTile[];
}) {
  const three = items.length === 3;
  return (
    <Section id={id} theme={theme}>
      <SectionHeader
        align="center"
        title={title}
        accent={accent}
        tone={tone}
        lead={lead}
        action={action}
        size="h2"
        className="mx-auto"
      />
      <ul
        className={cn(
          "mt-10 grid grid-cols-2 gap-1 md:mt-14 md:gap-[5px]",
          three ? "lg:grid-cols-[3fr_2fr]" : "lg:grid-cols-[3fr_1fr_1fr]",
        )}
      >
        {items.map((item, index) => {
          const big = index === 0;
          return (
            <li key={item.id} className={cn(big && "col-span-2 lg:col-span-1 lg:row-span-2")}>
              <a
                href={item.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-navy-deep p-4 text-white t-colors hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:rounded-[1.75rem] md:p-[18px]"
              >
                {item.badges?.length ? (
                  <span className="flex flex-wrap gap-2 pb-4">
                    {item.badges.map((badge) => (
                      <span
                        key={badge.text}
                        className={cn(
                          "rounded-pill px-2.5 py-1 text-caption font-medium",
                          badge.tone === "butter"
                            ? "bg-butter text-teal-ink"
                            : "bg-white/14 text-white/95",
                        )}
                      >
                        {badge.text}
                      </span>
                    ))}
                  </span>
                ) : null}
                <span className={cn("block", big ? "text-h3" : "text-h4")}>{item.title}</span>
                {item.price ? (
                  <span className="mt-2 block text-h4 tabular-nums text-butter">{item.price}</span>
                ) : null}
                {item.subtitle ? (
                  <span className="mt-2 block max-w-md text-small text-white/70">
                    {item.subtitle}
                  </span>
                ) : null}
                {item.media ? (
                  <span
                    className={cn(
                      "relative mt-6 block overflow-hidden rounded-lg",
                      big
                        ? "min-h-[16rem] flex-1"
                        : three
                          ? "aspect-square md:aspect-[2/1]"
                          : "aspect-square",
                    )}
                  >
                    <Media
                      src={item.media.src}
                      alt={item.media.alt}
                      tone="navy"
                      className="absolute inset-0 size-full rounded-none transition-transform duration-200 ease-in-out motion-safe:group-hover:scale-[1.03]"
                    />
                  </span>
                ) : null}
                <span
                  aria-hidden
                  className="absolute right-4 bottom-4 grid size-[38px] place-items-center rounded-full bg-white/14 t-colors group-hover:bg-white/30"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
