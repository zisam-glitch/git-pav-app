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
    <Section theme="white" aria-labelledby="aesthetics-values-heading">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
          Clinical Ethos
        </span>
        <div id="aesthetics-values-heading" className="mt-4">
          <Heading size="h2-md" accent="Values" tone="terracotta" inline>
            Our
          </Heading>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {VALUES.map((value, index) => (
          <Tile
            key={value.title}
            tone={index === 1 ? "sage" : "cream"}
            lift
            className="flex flex-col justify-between gap-6 border border-border/60 p-6 md:p-8"
          >
            <div>
              <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-copper tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-h4 text-fg">{value.title}</h3>
              <p className="mt-3 border-t border-border pt-4 text-body leading-relaxed text-muted">
                {value.desc}
              </p>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
