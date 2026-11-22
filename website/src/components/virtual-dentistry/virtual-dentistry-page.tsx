import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { VirtualDentistryBenefits } from "./virtual-dentistry-benefits";
import { VirtualDentistryFaq } from "./virtual-dentistry-faq";
import { VirtualDentistryHero } from "./virtual-dentistry-hero";
import { VirtualDentistryHowItWorks } from "./virtual-dentistry-how-it-works";
import { VirtualDentistryPrescriptionProcess } from "./virtual-dentistry-prescription-process";
import { VirtualDentistryRegistration } from "./virtual-dentistry-registration";
import { VirtualDentistryServices } from "./virtual-dentistry-services";

export function VirtualDentistryPage() {
  return (
    <main>
      <VirtualDentistryHero />
      <VirtualDentistryPrescriptionProcess />
      <VirtualDentistryHowItWorks />
      <VirtualDentistryBenefits />
      <VirtualDentistryFaq />
      <VirtualDentistryRegistration />
      <VirtualDentistryServices />
      <ClosingBand
        title="Need dental advice"
        highlight="from home?"
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
