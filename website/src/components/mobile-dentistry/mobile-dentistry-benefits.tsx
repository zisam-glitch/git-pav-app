import { BeigeGrid, BookButton, ButtonLink, Section, SectionHead } from "@/components/hims";

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
    <Section id="benefits" theme="white" aria-labelledby="mobile-benefits-heading">
      <SectionHead
        id="mobile-benefits-heading"
        title="Concerned about your residents' dental needs?"
        action={
          <div className="flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
          </div>
        }
      >
        We Are The Dentists That Come To You.
      </SectionHead>
      <div className="mt-10">
        <BeigeGrid items={BENEFITS.map((b) => ({ title: b }))} />
      </div>
    </Section>
  );
}
