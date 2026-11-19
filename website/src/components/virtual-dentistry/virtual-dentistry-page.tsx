import { BookButton, CallButton, CtaBand } from "@/components/hims";
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
        £35 Consultation Fee · £25 Prescription Cost · Open 24 hours, 7 days a week.
      </CtaBand>
    </main>
  );
}
