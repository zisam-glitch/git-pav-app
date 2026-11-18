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
    <Section id="financing" theme="white" aria-labelledby="cosmetic-financing-heading">
      <div className="rounded-xl bg-tile-cream p-6 md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.4fr_auto]">
          <div>
            <div id="cosmetic-financing-heading">
              <Heading size="h2-md" accent="Financing" tone="terracotta" inline>
                Costs and
              </Heading>
            </div>
            <p className="mt-4 max-w-3xl text-lead text-muted">
              The cost of cosmetic dentistry varies widely depending on the type of procedure, the
              expertise of the dentist, and geographic location. While many cosmetic procedures are
              not covered by dental insurance, financing options are often available.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <BookButton>Book Appointment</BookButton>
            <ButtonLink to="/pricing" variant="outline">
              View Pricing
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <div className="max-w-2xl">
          <Heading as="h3" size="h3" accent="General Dentist" tone="terracotta" inline>
            How to Choose a
          </Heading>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHOOSING_FACTORS.map((factor, index) => (
            <Tile key={factor.title} tone="cream" className="p-6">
              <span className="text-small font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-body text-muted">
                <strong className="font-medium text-fg">{factor.title}</strong> {factor.desc}
              </p>
            </Tile>
          ))}
        </div>
      </div>
    </Section>
  );
}
