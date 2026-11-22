import type { ReactNode } from "react";
import { CheckList, type CheckItem } from "./check-list";
import { Heading } from "./heading";
import { Section, type SectionTheme } from "./section";
import type { AccentTone } from "./tones";

/**
 * Opening band of a category or listing page: the H1 on the left, and on the right a lead, a short tick list
 * and the pill buttons. No picture: a row of tiles or a catalogue follows directly under it.
 *
 * Hims reference: `/hair-loss.html` hero (y57, 1440 wide). Measured: cream band `#faf8f2`, padding 60px top and
 * bottom (32px on a phone), a 1344px column (48px in from each edge), two columns of 616px with a 112px gap;
 * the H1 (52.83px / 410, line-height 1) and the right column both start at the top edge; right column: tick list
 * (20px row gap), 25px, buttons (48px pills, 10px apart), 35px, a note (15.67px at 50% black), disclaimer
 * (12.83px at 37%). Phone: one column, H1 32px / 450.
 *
 * Props: `title` (+ `accent`, `tone`, `inline`) make the one H1; `eyebrow` a node above it (a `Chip`);
 * `lead` a paragraph; `checks` tick-list items; `actions` button nodes; `note` small text under the buttons;
 * `theme` (cream by default); `id`; `label` (aria-label of the section).
 */
export function CategoryHero({
  id = "top",
  theme = "cream",
  eyebrow,
  title,
  accent,
  tone = "terracotta",
  inline = true,
  lead,
  checks,
  actions,
  note,
  label,
}: {
  id?: string;
  theme?: SectionTheme;
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  inline?: boolean;
  lead?: ReactNode;
  checks?: readonly (string | CheckItem)[];
  actions?: ReactNode;
  note?: ReactNode;
  label?: string;
}) {
  const hasAside = Boolean(lead || checks?.length || actions || note);
  /* token-request: band padding 32px phone / 60px desktop (py-8 md:py-[60px]), used by the Hims category, membership and product bands */
  return (
    <Section id={id} theme={theme} space="none" className="py-8 md:py-[60px]" aria-label={label}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-28">
        <div>
          {eyebrow ? <div className="mb-4">{eyebrow}</div> : null}
          <Heading as="h1" size="hero" accent={accent} tone={tone} inline={inline}>
            {title}
          </Heading>
        </div>
        {hasAside ? (
          <div className="flex flex-col items-start gap-6">
            {lead ? <p className="text-lead text-muted">{lead}</p> : null}
            {checks?.length ? <CheckList items={checks} /> : null}
            {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
            {note ? <div className="text-small text-subtle">{note}</div> : null}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
