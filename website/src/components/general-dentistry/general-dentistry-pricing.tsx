import { BookButton, Heading, Section } from "@/components/hims";
import { GeneralDentistryExtractionPricing } from "./general-dentistry-extraction-pricing";
import { GeneralDentistryFillingPricing } from "./general-dentistry-filling-pricing";
import { GeneralDentistryRootCanalPricing } from "./general-dentistry-root-canal-pricing";

export function GeneralDentistryPricing() {
  return (
    <Section id="pricing" theme="white">
      <div className="mx-auto max-w-2xl text-center">
        <Heading size="h2-md" accent="Prices" tone="terracotta" inline>
          General Dentistry
        </Heading>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <GeneralDentistryRootCanalPricing />
        <GeneralDentistryFillingPricing />
        <GeneralDentistryExtractionPricing />
      </div>

      <div className="mt-10 text-center">
        <BookButton>Book Appointment</BookButton>
      </div>
    </Section>
  );
}
