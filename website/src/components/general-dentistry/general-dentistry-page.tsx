import { GeneralDentistryHero } from "./general-dentistry-hero";
import { GeneralDentistryCavities } from "./general-dentistry-cavities";
import { GeneralDentistryServices } from "./general-dentistry-services";
import { GeneralDentistryImportance } from "./general-dentistry-importance";
import { GeneralDentistryFillingPricingTable } from "./general-dentistry-filling-pricing-table";
import { GeneralDentistryExtractionPricingTable } from "./general-dentistry-extraction-pricing-table";
import { GeneralDentistryRootCanalPricingTable } from "./general-dentistry-root-canal-pricing-table";
import { GeneralDentistryRootCanalConsent } from "./general-dentistry-root-canal-consent";
import { GeneralDentistryExtractionConsent } from "./general-dentistry-extraction-consent";
import { GeneralDentistryShowcase } from "./general-dentistry-showcase";
import { GeneralDentistryChoosing } from "./general-dentistry-choosing";
import { GeneralDentistryFaq } from "./general-dentistry-faq";

export function GeneralDentistryPage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <GeneralDentistryHero />
      <GeneralDentistryCavities />
      <GeneralDentistryRootCanalPricingTable />
      <GeneralDentistryRootCanalConsent />
      <GeneralDentistryExtractionPricingTable />
      <GeneralDentistryExtractionConsent />
      <GeneralDentistryFillingPricingTable />
      <GeneralDentistryServices />
      <GeneralDentistryImportance />
      <GeneralDentistryChoosing />
      <GeneralDentistryShowcase />
      <GeneralDentistryFaq />
    </main>
  );
}
