import type { ReactNode } from "react";
import { Heading } from "./heading";
import { InfoAccordion, type InfoAccordionItem } from "./info-accordion";
import { Section, type SectionTheme } from "./section";
import type { AccentTone } from "./tones";

/**
 * A page's frequently asked questions in the Hims layout: the heading on the left, the accordion rows on the
 * right.
 *
 * Hims reference: `/testosterone.html` FAQ block (y8952, 1440 wide): white panel, 24px radius, 60px padding;
 * two 616px columns 112px apart; the left heading is 37.5px / 436 ("heading-l"); the right column is 11 native
 * `<details>` rows (see `InfoAccordion`). On a phone the columns stack (heading, then rows) with 32px padding.
 *
 * Props: `title` + `accent` (the one H2; the live words stay exactly as they are), `tone`, `lead`, `actions`
 * (buttons under the heading: BookButton and CallButton), `items` (questions and answers), `theme` (default white),
 * `defaultOpen`, `exclusive`, `id`.
 */
export function FaqSection({
  id = "faq",
  theme = "white",
  title,
  accent,
  tone = "terracotta",
  lead,
  actions,
  items,
  defaultOpen,
  exclusive,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  actions?: ReactNode;
  items: readonly InfoAccordionItem[];
  defaultOpen?: number | null;
  exclusive?: boolean;
}) {
  return (
    <Section id={id} theme={theme}>
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-28">
        <div className="lg:sticky lg:top-24">
          <Heading as="h2" size="h3" accent={accent} tone={tone} inline>
            {title}
          </Heading>
          {lead ? <p className="mt-4 text-lead text-muted">{lead}</p> : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        <InfoAccordion items={items} defaultOpen={defaultOpen} exclusive={exclusive} />
      </div>
    </Section>
  );
}
