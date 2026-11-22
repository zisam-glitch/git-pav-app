import { Clock, PoundSterling, Syringe } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function RootCanalHero() {
  return (
    <TreatmentHero
      label="Pav Dental Advanced Root Canal Care"
      title="Pav Dental"
      accent="Advanced Root Canal Care"
      lead="Explore our transparent root canal pricing for basic, intermediate, and advanced treatments, along with essential information to help you make an informed decision about your dental care."
      facts={[
        { icon: PoundSterling, text: "Basic £195, Intermediate £295, Advanced £395" },
        { icon: Clock, text: "Most root canals take 45–90 minutes" },
        { icon: Syringe, text: "Local anesthesia ensures comfort during the procedure" },
      ]}
      actions={
        <>
          <BookButton>Make an Appointment</BookButton>
          <ButtonLink to="/contact-us" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a
            href="#pricing"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Our Root Canal Prices
          </a>
          <a
            href="#consent"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Informed Consent for Root Canal Treatment
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/root-canal-hero.jpg",
          alt: "Warm sunlit Pav Dental treatment room prepared for root canal care",
          tone: "sand",
        },
      ]}
    />
  );
}
