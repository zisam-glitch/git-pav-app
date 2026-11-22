import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section, type SectionTheme } from "./section";
import { SectionHeader } from "./section-header";
import type { AccentTone } from "./tones";

export type Step = { title: ReactNode; body: ReactNode };

const CARD = {
  sage: "bg-tile-sage",
  cream: "bg-tile-cream",
  sand: "bg-sand",
} as const;

/**
 * Numbered "how it works" steps: a big rounded card with the steps listed on the left and one picture (or a
 * video player) on the right.
 *
 * Hims reference: the "Testosterone, built for you" card on `/testosterone.html` (y2500, 1440 wide): a 1325x900
 * card with a 46.67px radius and a soft gradient; the copy panel (46.67px / 110px padding) holds three step rows
 * (31px / 452 text, 9.7px apart, a thin vertical rule beside each, the first word in a heavier weight); the
 * picture fills the right 773px. Hims reveals the steps one by one as you scroll; this version lists all of them
 * (every word stays in the server HTML). The PDP's "How to apply" band (`/hair-loss/minoxidil.html`, y2723) is the
 * picture-per-step variant: use `BenefitCards variant="plain"` for that.
 *
 * Props: `title` + `accent` (the one H2), `tone`, `lead`, `action`, `steps` (`{ title, body }`; the title renders
 * as an H3), `media` (a node: `Media`, or a player), `card` (card tint: "sage" default, "cream" or "sand"),
 * `theme`, `id`.
 */
export function Steps({
  id,
  theme = "white",
  title,
  accent,
  tone = "terracotta",
  lead,
  action,
  steps,
  media,
  card = "sage",
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  action?: ReactNode;
  steps: readonly Step[];
  media?: ReactNode;
  card?: keyof typeof CARD;
}) {
  return (
    <Section id={id} theme={theme}>
      <SectionHeader title={title} accent={accent} tone={tone} lead={lead} action={action} />
      <div
        className={cn(
          "mt-10 grid gap-8 rounded-[2rem] p-5 md:p-10 lg:items-center lg:gap-14",
          media && "lg:grid-cols-[5fr_6fr]",
          CARD[card],
        )}
      >
        <ol className="grid gap-2">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-4 border-l-2 border-black/15 py-3 pl-5">
              <span className="pt-1 text-label tabular-nums text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-h3-md">{step.title}</h3>
                <p className="mt-2 text-body text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {media ? <div>{media}</div> : null}
      </div>
    </Section>
  );
}
