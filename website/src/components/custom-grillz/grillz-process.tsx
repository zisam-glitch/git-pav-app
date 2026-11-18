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
    <Section id="why-pav" theme="white">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Pav Dental Grillz?" tone="terracotta" inline>
          Why Choose
        </Heading>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((item, i) => (
          <Tile key={item.title} tone="cream" className="p-6 md:p-7">
            <span className="text-small font-medium text-terracotta tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 text-fg">{item.title}</h3>
            <p className="mt-2 text-body text-muted">{item.desc}</p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
