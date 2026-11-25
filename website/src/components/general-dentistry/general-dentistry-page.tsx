import { ContactForm } from "@/components/home/contact-form";
import { BookButton, CallButton, CtaBand, FloatingCta } from "@/components/hims";
import { GeneralDentistryCavities } from "./general-dentistry-cavities";
import { GeneralDentistryChoosing } from "./general-dentistry-choosing";
import { GeneralDentistryExtractionConsent } from "./general-dentistry-extraction-consent";
import { GeneralDentistryExtractionPricingTable } from "./general-dentistry-extraction-pricing-table";
import { GeneralDentistryFaq } from "./general-dentistry-faq";
import { GeneralDentistryFillingPricingTable } from "./general-dentistry-filling-pricing-table";
import { GeneralDentistryHero } from "./general-dentistry-hero";
import { GeneralDentistryImportance } from "./general-dentistry-importance";
import { GeneralDentistryRootCanalConsent } from "./general-dentistry-root-canal-consent";
import { GeneralDentistryRootCanalPricingTable } from "./general-dentistry-root-canal-pricing-table";
import { GeneralDentistryServices } from "./general-dentistry-services";
import { GeneralDentistryShowcase } from "./general-dentistry-showcase";

export function GeneralDentistryPage() {
  return (
    <main className="bg-white">
      <GeneralDentistryHero />
      <div id="cavities">
        <GeneralDentistryCavities />
      </div>
      <GeneralDentistryRootCanalPricingTable />
      <GeneralDentistryRootCanalConsent />
      <div id="extraction">
        <GeneralDentistryExtractionPricingTable />
      </div>
      <GeneralDentistryExtractionConsent />
      <div id="fillings">
        <GeneralDentistryFillingPricingTable />
      </div>
      <GeneralDentistryServices />
      <GeneralDentistryImportance />
      <GeneralDentistryChoosing />
      <GeneralDentistryShowcase />
      <GeneralDentistryFaq />
      <FloatingCta>
        <BookButton>Book Appointment</BookButton>
      </FloatingCta>
      <ContactForm />
    </main>
  );
}
