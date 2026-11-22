import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { MobileDentistryBenefits } from "./mobile-dentistry-benefits";
import { MobileDentistryContact } from "./mobile-dentistry-contact";
import { MobileDentistryHero } from "./mobile-dentistry-hero";
import { MobileDentistryLocation } from "./mobile-dentistry-location";
import { MobileDentistryService } from "./mobile-dentistry-service";

export function MobileDentistryPage() {
  return (
    <main className="bg-bg">
      <MobileDentistryHero />
      <MobileDentistryBenefits />
      <MobileDentistryService />
      <MobileDentistryLocation />
      <MobileDentistryContact />
      <CtaBand
        theme="brown"
        title="Ready to arrange"
        accent="a mobile visit?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>
    </main>
  );
}
