import { ContactForm } from "@/components/home/contact-form";
import { BookButton, FloatingCta } from "@/components/hims";
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
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
      <ContactForm />
    </main>
  );
}
