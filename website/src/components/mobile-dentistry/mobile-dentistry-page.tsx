import { MobileDentistryHero } from "./mobile-dentistry-hero";
import { MobileDentistryBenefits } from "./mobile-dentistry-benefits";
import { MobileDentistryService } from "./mobile-dentistry-service";
import { MobileDentistryLocation } from "./mobile-dentistry-location";
import { MobileDentistryContact } from "./mobile-dentistry-contact";

export function MobileDentistryPage() {
  return (
    <main className="bg-[#FBF8F5]">
      <MobileDentistryHero />
      <MobileDentistryBenefits />
      <MobileDentistryService />
      <MobileDentistryLocation />
      <MobileDentistryContact />
    </main>
  );
}
