import { Heading, Section, Tile } from "@/components/hims";

const REASONS = [
  {
    title: "Worldwide Reach",
    desc: "No matter your location, our grillz are just a scan away.",
  },
  {
    title: "Expert Craftsmanship",
    desc: "With attention to detail and quality, we create pieces that are as unique as you.",
  },
  {
    title: "Personalized Experience",
    desc: "From design to delivery, your preferences are our priority.",
  },
  {
    title: "Peace of Mind",
    desc: "Our 1-year guarantee means your investment is protected.",
  },
] as const;

export function GrillzProcess() {
  return (
    <Section id="why-pav" theme="white" aria-labelledby="grillz-why-pav-heading">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
          Clinical Craftsmanship
        </span>
        <div id="grillz-why-pav-heading" className="mt-4">
          <Heading size="h2-md" accent="Pav Dental Grillz?" tone="terracotta" inline>
            Why Choose
          </Heading>
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((item, i) => (
          <Tile
            key={item.title}
            tone={i % 2 === 1 ? "sage" : "cream"}
            lift
            className="flex flex-col justify-between border border-border/60 p-6 md:p-7"
          >
            <div>
              <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 border-t border-border pt-4 text-body leading-relaxed text-muted">
                <strong className="mb-2 block text-h4 text-fg">{`${item.title}:`}</strong>
                {item.desc}
              </p>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
