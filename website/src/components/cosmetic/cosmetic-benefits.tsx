import { Heading, Section, Tile } from "@/components/hims";

const BENEFITS = [
  {
    title: "1. Enhanced Appearance:",
    desc: "The most obvious benefit is a more attractive smile.",
  },
  {
    title: "2. Boosted Confidence:",
    desc: "A better smile often leads to increased self-esteem and confidence.",
  },
  {
    title: "3. Improved Oral Health:",
    desc: "Some procedures can help improve your oral health by making cleaning easier.",
  },
  {
    title: "4. Long-Lasting Results:",
    desc: "Many cosmetic dentistry procedures offer long-term or permanent solutions.",
  },
  {
    title: "5. Wider Range of Options:",
    desc: "There are treatments available for almost every aesthetic issue you might have with your teeth.",
  },
] as const;

export function CosmeticBenefits() {
  return (
    <Section theme="cream" aria-labelledby="cosmetic-benefits-heading">
      <div className="max-w-2xl">
        <div id="cosmetic-benefits-heading">
          <Heading size="h2-md" accent="Cosmetic Dentistry" tone="terracotta" inline>
            Benefits of
          </Heading>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => (
          <Tile key={benefit.title} tone="white" className="p-6 md:p-7">
            <span className="text-small font-medium text-terracotta tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 text-fg">{benefit.title}</h3>
            <p className="mt-2 text-body text-muted">{benefit.desc}</p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
