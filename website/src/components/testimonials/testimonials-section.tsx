import { Reveal } from "@/components/home/reveal";
import { TESTIMONIALS_HEADING, TESTIMONIALS_INTRO, type Testimonial } from "@/content/testimonials";

/**
 * The "What people say?" section. It shows only the comments in `content/testimonials.ts`,
 * which are the ones the live site publishes. No names, ratings, star rows or counts: the
 * live site has none, and none may be added here.
 */
const THEMES = {
  home: {
    section: "py-24",
    heading: "font-display text-3xl sm:text-4xl",
    intro: "mt-4 text-muted",
    card: "glass h-full rounded-xl p-8",
    title: "font-display text-lg text-fg",
    text: "mt-3 text-sm leading-relaxed text-muted",
  },
  warm: {
    section: "bg-[#fffdf9] py-20 sm:py-28",
    heading: "font-display text-3xl font-bold text-[#2a1c12] sm:text-5xl",
    intro: "mt-3 text-sm leading-relaxed text-[#6b5848] sm:text-base",
    card: "h-full rounded-xl border border-[#e2d4c0] bg-white p-8",
    title: "font-display text-lg font-bold text-[#2a1c12]",
    text: "mt-3 text-sm leading-relaxed text-[#6b5848]",
  },
} as const;

export function TestimonialsSection({
  testimonials,
  theme = "home",
}: {
  testimonials: readonly Testimonial[];
  theme?: keyof typeof THEMES;
}) {
  const t = THEMES[theme];
  const columns = testimonials.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <section className={t.section} aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-heading" className={t.heading}>
            {TESTIMONIALS_HEADING}
          </h2>
          <p className={t.intro}>{TESTIMONIALS_INTRO}</p>
        </Reveal>

        <ul className={`mt-12 grid list-none gap-6 ${columns}`}>
          {testimonials.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 0.06} className="h-full">
                <article className={t.card}>
                  <h3 className={t.title}>{item.title}</h3>
                  <p className={t.text}>{item.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
