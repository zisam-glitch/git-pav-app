import { Reveal } from "@/components/home/reveal";
import { TESTIMONIALS_HEADING, TESTIMONIALS_INTRO, type Testimonial } from "@/content/testimonials";

/**
 * The "What people say?" section. It shows only the comments in `content/testimonials.ts`,
 * which are the ones the live site publishes. No names, ratings, star rows or counts: the
 * live site has none, and none may be added here.
 */
const THEMES = {
  home: {
    section: "py-16 sm:py-24",
    heading: "font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl",
    intro: "mt-4 text-base text-black/60",
    cards: [
      "hims-tile-warm h-full rounded-[1.5rem] border border-black/6 p-8",
      "hims-tile-sage h-full rounded-[1.5rem] border border-black/6 p-8",
      "h-full rounded-[1.5rem] border border-black/6 bg-[#F2EDE5] p-8",
    ],
    title: "font-display text-xl font-normal tracking-[-0.02em] text-black",
    text: "mt-4 text-sm leading-relaxed text-black/70",
  },
  warm: {
    section: "bg-[#FBF8F5] py-16 sm:py-24",
    heading: "font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl",
    intro: "mt-4 text-base text-black/60",
    cards: [
      "hims-tile-warm h-full rounded-[1.5rem] border border-black/6 p-8",
      "hims-tile-sage h-full rounded-[1.5rem] border border-black/6 p-8",
      "h-full rounded-[1.5rem] border border-black/6 bg-[#F2EDE5] p-8",
    ],
    title: "font-display text-xl font-normal tracking-[-0.02em] text-black",
    text: "mt-4 text-sm leading-relaxed text-black/70",
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
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-heading" className={t.heading}>
            {TESTIMONIALS_HEADING}
          </h2>
          <p className={t.intro}>{TESTIMONIALS_INTRO}</p>
        </Reveal>

        <ul className={`mt-12 grid list-none gap-4 ${columns}`}>
          {testimonials.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 0.06} className="h-full">
                <article className={t.cards[index % t.cards.length]}>
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
