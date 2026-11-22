import { Home, MapPin, Stethoscope } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function MobileDentistryHero() {
  return (
    <TreatmentHero
      label="Mobile dental care"
      badge="Coming Soon"
      title="Mobile dental care"
      accent="at Doorstep"
      lead={
        <>
          Experience Convenient Mobile Dental Care with Comprehensive Dentistry Delivered to Your
          Doorstep :
        </>
      }
      facts={[
        { icon: Home, text: "Dental services from the comfort of your own home" },
        { icon: Stethoscope, text: "A modern, well-equipped mobile surgery" },
        { icon: MapPin, text: "Pav Dental Mobile visits patients across the UK" },
      ]}
      actions={
        <>
          <BookButton>Make an Appointment</BookButton>
          <ButtonLink href="#contact" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      note="Pav Dental Mobile is a unique dental service that enables our patients to access a full range of dental services from the comfort of their own home. With many combined years of dental experience in both traditional and mobile dentistry along with the latest technology and equipment we guarantee our patients the upmost satisfactory service."
      tiles={[
        {
          src: "/images/generated/mobile-dentistry-hero.jpg",
          alt: "Pav Dental mobile dentistry equipment in warm natural light",
          tone: "cream",
        },
      ]}
    />
  );
}
