import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";

const BENEFITS = [
  "Unique mobile dental service",
  "Working with care homes",
  "Make your home oral-health CQC-compliant",
  "NHS partners",
  "The very latest mobile dental equipment",
  "Hundreds of satisfied patients",
  "Attract more residents",
  "Engage carers and improve staff retention",
] as const;

export function MobileDentistryBenefits() {
  return (
    <Section id="benefits" theme="white" space="default" aria-labelledby="mobile-benefits-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Care Homes &amp; Residential Visits
          </span>
          <div id="mobile-benefits-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="dental needs?" tone="terracotta" inline>
              Concerned about your residents&apos;
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">We Are The Dentists That Come To You.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <BookButton size="sm">Make an Appointment</BookButton>
          <ButtonLink href="#contact" variant="outline" size="sm">
            Contact us
          </ButtonLink>
        </div>
      </div>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit, index) => (
          <Tile
            key={benefit}
            as="li"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 border border-border p-6 md:p-7"
          >
            <span className="inline-flex w-fit items-center rounded-pill bg-cream px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="border-t border-border pt-4 text-h4 text-fg">{benefit}</h3>
          </Tile>
        ))}
      </ol>
    </Section>
  );
}
