import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { MobileDentistryBenefits } from "./mobile-dentistry-benefits";
import { MobileDentistryContact } from "./mobile-dentistry-contact";
import { MobileDentistryHero } from "./mobile-dentistry-hero";
import { MobileDentistryLocation } from "./mobile-dentistry-location";
import { MobileDentistryService } from "./mobile-dentistry-service";

export function MobileDentistryPage() {
  return (
    <main>
      <MobileDentistryHero />
      <MobileDentistryBenefits />
      <MobileDentistryService />
      <MobileDentistryLocation />
      <MobileDentistryContact />
      <ClosingBand
        title="Ready to arrange"
        highlight="a mobile visit?"
        lead="Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine check-ups, and advanced technologies like digital imaging and laser dentistry."
        actions={
          <>
            <BookButton variant="butter">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
    </main>
  );
}
