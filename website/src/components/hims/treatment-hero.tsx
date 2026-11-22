import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Media } from "./media";
import { Section } from "./section";
import type { AccentTone } from "./tones";

export type HeroFact = { text: ReactNode; icon?: LucideIcon };
export type HeroTile = {
  src?: string;
  alt: string;
  tone?: "cream" | "sage" | "sand" | "brown" | "navy" | "clay";
};

/**
 * Opening section of a treatment page: headline and lead on the left, three key facts and the buttons on the
 * right, and a strip of picture tiles underneath.
 *
 * Hims reference: the condition capture `/testosterone.html` (section y112, 1440 wide): cream band (#f8f4ef),
 * 80px top padding; the H1 (52.83px / 410, 637px wide) sits on the left; a 424px column on the right holds three
 * value-prop rows (40px round icon + 16px/480 text, 48px tall, 4px apart) and the buttons (48px pills, 8px apart,
 * stacked full width on a phone); 80px below, a strip of 373x496 tiles with 24px radius and 8px gaps. On a phone
 * (390px): H1 32px/450, rows and stacked buttons under it. The PDP hero (`/hair-loss/minoxidil.html`) is the
 * shop's, not this component.
 *
 * Props: `title` + `accent` (the one H1; accent is the second line), `tone`, `lead`, `badge` (small pill above
 * the H1, only when the live page has such a label), `facts` (up to three `{ text, icon }` rows, each from live
 * content), `actions` (button nodes: one primary BookButton and at most one outline), `note` (small links or
 * disclaimer under the buttons), `tiles` (picture tiles; one tile is an 8:3 band (522px tall at 1440; the Hims strip is 496px), two are 16:9, three 4:3, four
 * or more 3:4), `id`, `label` (aria-label of the section).
 */
export function TreatmentHero({
  id = "top",
  badge,
  title,
  accent,
  tone = "terracotta",
  lead,
  facts,
  actions,
  note,
  tiles,
  label,
  eagerTiles = false,
}: {
  id?: string;
  badge?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  facts?: readonly HeroFact[];
  actions?: ReactNode;
  note?: ReactNode;
  tiles?: readonly HeroTile[];
  label?: string;
  /** Load every tile picture eagerly (default: only the first). */
  eagerTiles?: boolean;
}) {
  const count = tiles?.length ?? 0;
  const ratio = count === 1 ? "8 / 3" : count === 2 ? "16 / 9" : count === 3 ? "4 / 3" : "3 / 4";
  const columns =
    count <= 1
      ? "grid-cols-1"
      : count === 2
        ? "sm:grid-cols-2"
        : count === 3
          ? "sm:grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4";

  return (
    <Section id={id} theme="cream" aria-label={label}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="lg:max-w-[44rem]">
          {badge ? (
            <p className="mb-4 inline-flex rounded-pill bg-white px-3 py-1 text-caption font-medium text-terracotta">
              {badge}
            </p>
          ) : null}
          <Heading as="h1" size="hero" accent={accent} tone={tone}>
            {title}
          </Heading>
          {lead ? <p className="mt-5 max-w-xl text-lead text-muted">{lead}</p> : null}
        </div>

        <div className="flex flex-col gap-6 lg:w-[26.5rem] lg:shrink-0">
          {facts?.length ? (
            <ul className="grid gap-1">
              {facts.map((fact, index) => {
                const Icon = fact.icon ?? Check;
                return (
                  <li key={index} className="flex items-center gap-4 py-1">
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-terracotta"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-label">{fact.text}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {actions ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>*]:max-sm:w-full">
              {actions}
            </div>
          ) : null}
          {note ? <div className="text-small text-muted">{note}</div> : null}
        </div>
      </div>

      {count ? (
        <ul className={cn("mt-10 grid gap-2 md:mt-20", columns)}>
          {tiles!.map((tile, index) => (
            <li key={`${tile.alt}-${index}`}>
              <Media
                src={tile.src}
                alt={tile.alt}
                ratio={ratio}
                tone={tile.tone ?? "sand"}
                priority={eagerTiles || index === 0}
                className={count === 1 ? "max-md:!aspect-[4/3]" : undefined}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
