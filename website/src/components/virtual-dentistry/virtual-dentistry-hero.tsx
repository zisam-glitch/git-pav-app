import { Clock, PoundSterling, Receipt } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function VirtualDentistryHero() {
  return (
    <TreatmentHero
      label="Virtual dentistry services"
      title="Affordable"
      accent="Healthcare Services"
      lead="Affordable Healthcare Services: £35 Consultation Fee and £25 Prescription Cost. Quality medical advice and prescriptions at budget-friendly prices to ensure your health needs are met without breaking the bank."
      facts={[
        { icon: PoundSterling, text: "£35 Consultation Fee" },
        { icon: Receipt, text: "£25 Prescription Cost" },
        { icon: Clock, text: "24 x 7 Emergency Dentists" },
      ]}
      actions={
        <>
          <BookButton>Book appointment</BookButton>
          <ButtonLink href="#how-it-works" variant="outline">
            How it works
          </ButtonLink>
        </>
      }
      tiles={[
        {
          src: "/images/generated/virtual-dentistry-hero.jpg",
          alt: "Virtual dental video consultation on a tablet in warm natural light",
          tone: "cream",
        },
      ]}
    />
  );
}
