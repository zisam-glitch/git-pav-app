import { Heading, Section, Tile } from "@/components/hims";
import {
  AESTHETICS_TESTIMONIALS,
  TESTIMONIALS_HEADING,
  TESTIMONIALS_INTRO,
} from "@/content/testimonials";

/**
 * Hims-style editorial testimonials trio (Mobbin 6db670d9):
 * three warm cream/sage rounded-xl tiles with top pill tags and crisp large quote typography.
 * Displays only the live comments from `content/testimonials.ts` — no stars, ratings, or names.
 */
export function AestheticsTestimonials() {
  return (
    <Section theme="white" space="default" aria-labelledby="testimonials-heading">
      <div className="max-w-2xl">
        <div id="testimonials-heading" className="mt-4">
          <Heading as="h2" size="h2-md" accent="say?" tone="terracotta" inline>
            {TESTIMONIALS_HEADING.replace(/\s*say\?$/, "")}
          </Heading>
        </div>
        <p className="mt-4 text-lead text-muted">{TESTIMONIALS_INTRO}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {AESTHETICS_TESTIMONIALS.map((item, index) => (
          <Tile
            key={item.title}
            as="article"
            tone={index === 1 ? "sage" : "cream"}
            lift
            className="flex h-full flex-col justify-between gap-8 border border-border/60 p-6 md:p-8"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
                  {item.title}
                </h3>
                <span className="text-caption font-medium text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-6 text-lead leading-relaxed text-fg">{item.text}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-caption text-muted">
              <span>Pav Dental Aesthetics</span>
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(AESTHETICS_TESTIMONIALS.length).padStart(2, "0")}
              </span>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
