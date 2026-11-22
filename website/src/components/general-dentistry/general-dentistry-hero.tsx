import { Clock, PoundSterling, Stethoscope } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

const ANCHOR =
  "inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta";

export function GeneralDentistryHero() {
  return (
    <TreatmentHero
      label="General dentistry services"
      title="General Dentistry: Your"
      accent="Gateway to Lifelong Oral Health"
      lead="Welcome to your guide to General Dentistry, covering check-ups to fillings. Discover how it maintains and improves your dental health for lifelong healthy smiles."
      facts={[
        { icon: PoundSterling, text: "Basic Root Canal (£195)" },
        { icon: Stethoscope, text: "Basic Composite (£95)" },
        { icon: Clock, text: "Simple Extraction (£95)" },
      ]}
      actions={
        <>
          <BookButton>Book Appointment</BookButton>
          <ButtonLink to="/contact-us" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a href="#pricing" className={ANCHOR}>
            Treatment Prices
          </a>
          <a href="#services" className={ANCHOR}>
            Services Offered
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/general-dentistry-hero.jpg",
          alt: "Minimalist dental examination mirror and ceramic care vessel in warm natural light",
          tone: "cream",
        },
      ]}
    />
  );
}
