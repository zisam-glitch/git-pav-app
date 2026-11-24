import { BookButton, CallButton, CtaBand, FloatingCta } from "@/components/hims";
import { VirtualDentistryBenefits } from "./virtual-dentistry-benefits";
import { VirtualDentistryFaq } from "./virtual-dentistry-faq";
import { VirtualDentistryHero } from "./virtual-dentistry-hero";
import { VirtualDentistryHowItWorks } from "./virtual-dentistry-how-it-works";
import { VirtualDentistryPrescriptionProcess } from "./virtual-dentistry-prescription-process";
import { VirtualDentistryRegistration } from "./virtual-dentistry-registration";
import { VirtualDentistryServices } from "./virtual-dentistry-services";

export function VirtualDentistryPage() {
  return (
    <main className="bg-white">
      <VirtualDentistryHero />
      <VirtualDentistryPrescriptionProcess />
      <VirtualDentistryHowItWorks />
      <VirtualDentistryBenefits />
      <VirtualDentistryRegistration />
      <VirtualDentistryServices />
      <VirtualDentistryFaq />
      <CtaBand
        theme="brown"
        title="Need dental advice"
        accent="from home?"
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
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
