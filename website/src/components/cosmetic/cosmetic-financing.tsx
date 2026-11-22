import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";

const CHOOSING_FACTORS = [
  {
    title: "Experience and Qualifications:",
    desc: "Look for a dentist with specialized training and a portfolio of before-and-after cases.",
  },
  {
    title: "Technology:",
    desc: "Opt for a clinic that uses the latest technology for more precise and effective treatments.",
  },
  {
    title: "Reviews and Testimonials:",
    desc: "Customer reviews can provide valuable insights into patient satisfaction and quality of service.",
  },
  {
    title: "Consultation:",
    desc: "A thorough initial consultation is a good sign of a dentist’s professionalism and concern for your needs.",
  },
] as const;

export function CosmeticFinancing() {
  return (
    <Section id="financing" theme="sand" aria-labelledby="cosmetic-financing-heading">
      <Tile tone="white" className="border border-border p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.4fr_auto]">
          <div>
            <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-copper">
              Fees & Flexible Plans
            </span>
            <div id="cosmetic-financing-heading" className="mt-4">
              <Heading size="h2-md" accent="Financing" tone="terracotta" inline>
                Costs and
              </Heading>
            </div>
            <p className="mt-4 max-w-3xl text-lead leading-relaxed text-muted">
              The cost of cosmetic dentistry varies widely depending on the type of procedure, the
              expertise of the dentist, and geographic location. While many cosmetic procedures are
              not covered by dental insurance, financing options are often available.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:justify-end">
            <BookButton className="w-full md:w-auto">Book Appointment</BookButton>
            <ButtonLink to="/pricing" variant="outline" className="w-full md:w-auto">
              View Pricing
            </ButtonLink>
          </div>
        </div>
      </Tile>

      <div className="mt-14">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Patient Checklist
          </span>
          <Heading as="h3" size="h3" accent="General Dentist" tone="terracotta" inline className="mt-4">
            How to Choose a
          </Heading>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHOOSING_FACTORS.map((factor, index) => (
            <Tile key={factor.title} tone="white" lift className="p-6 md:p-7">
              <span className="inline-flex items-center rounded-pill bg-cream px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 border-t border-border pt-4 text-body leading-relaxed text-muted">
                <strong className="font-medium text-fg">{factor.title}</strong> {factor.desc}
              </p>
            </Tile>
          ))}
        </div>
      </div>
    </Section>
  );
}
