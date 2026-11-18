import { Carousel, Heading, Section } from "@/components/hims";
import { TESTIMONIALS_HEADING, TESTIMONIALS_INTRO, type Testimonial } from "@/content/testimonials";

/**
 * The "What people say?" section. It shows only the comments in `content/testimonials.ts`,
 * which are the ones the live site publishes. No names, ratings, star rows or counts: the
 * live site has none, and none may be added here.
 */
export function TestimonialsSection({
  testimonials,
  theme = "home",
}: {
  testimonials: readonly Testimonial[];
  theme?: "home" | "warm" | "navy";
}) {
  if (theme === "warm") {
    return (
      <Section theme="cream" space="default" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-heading" className="text-h2-md text-fg">
            {TESTIMONIALS_HEADING}
          </h2>
          <p className="mt-4 text-lead text-muted">{TESTIMONIALS_INTRO}</p>
        </div>

        <Carousel label={TESTIMONIALS_HEADING} className="mt-10">
          {testimonials.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col justify-between rounded-xl border border-border bg-white p-6 md:p-8"
            >
              <p className="text-body leading-relaxed text-fg">{item.text}</p>
              <h3 className="mt-6 text-small font-medium text-fg">{item.title}</h3>
            </article>
          ))}
        </Carousel>
      </Section>
    );
  }

  return (
    <Section
      theme="white"
      width="max"
      space="sm"
      className="px-2 md:px-4"
      aria-labelledby="testimonials-heading"
    >
      <div className="rounded-xl bg-navy py-14 text-white md:py-[7.5rem]">
        <div className="wrap-bento">
          <div className="max-w-2xl">
            <div id="testimonials-heading">
              <Heading as="h2" size="hero" accent="say?" tone="butter" inline>
                What people
              </Heading>
            </div>
            <p className="mt-4 text-lead text-white/80">{TESTIMONIALS_INTRO}</p>
          </div>

          <Carousel label={TESTIMONIALS_HEADING} arrows="dark" className="mt-10">
            {testimonials.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col justify-between rounded-xl bg-white/7 p-6 md:px-6 md:py-9"
              >
                <div>
                  <h3 className="text-h4 text-white">{item.title}</h3>
                  <p className="mt-3 text-lead text-white/75">{item.text}</p>
                </div>
                <p className="mt-6 text-small text-butter">Patient feedback</p>
              </article>
            ))}
          </Carousel>
        </div>
      </div>
    </Section>
  );
}
