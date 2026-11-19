import { Heading, Section, Tile } from "@/components/hims";

const VALUES = [
  {
    title: "Wholehearted Commitment",
    desc: "Our motivation stems from a genuine desire to provide the best care, rather than being driven by sales incentives.",
  },
  {
    title: "Expert Guidance",
    desc: "We take immense pride in delivering expert advice and guidance to our valued clients.",
  },
  {
    title: "Quality Assurance",
    desc: "Our unwavering commitment lies in using the utmost quality products, with no room for compromise.",
  },
] as const;

export function AestheticsValues() {
  return (
    <Section theme="cream" aria-labelledby="aesthetics-values-heading">
      <div className="max-w-2xl">
        <div id="aesthetics-values-heading">
          <Heading size="h2-md" accent="Values" tone="terracotta" inline>
            Our
          </Heading>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {VALUES.map((value, index) => (
          <Tile key={value.title} tone="white" className="p-6 md:p-8">
            <span className="text-small font-medium text-terracotta tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 text-fg">{value.title}</h3>
            <p className="mt-3 text-body text-muted">{value.desc}</p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
