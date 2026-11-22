import { Clock, HeartHandshake, PoundSterling } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

const ANCHOR =
  "inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta";

export function ExtractionHero() {
  return (
    <TreatmentHero
      label="Pav Dental: Same day Tooth Extraction"
      title="Pav Dental:"
      accent="Same day Tooth Extraction"
      lead="At Pav Dental, our experienced oral surgeons are dedicated to providing you with the highest standard of care. Utilizing the latest techniques and technologies, we ensure a comfortable and effective treatment experience."
      facts={[
        {
          icon: Clock,
          text: "Same-day tooth extraction services to provide you with immediate relief",
        },
        { icon: PoundSterling, text: "Simple Extraction (£95) to Surgical Extraction (£295)" },
        { icon: HeartHandshake, text: "Comprehensive aftercare support" },
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
          <a href="#pricing" className={ANCHOR}>
            Our Tooth Extraction Prices (£95 – £295)
          </a>
          <a href="#post-op" className={ANCHOR}>
            Post Operative Instructions
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/tooth-extraction-hero.jpg",
          alt: "Serene Pav Dental oral surgery suite in warm natural light prepared for same-day tooth extraction",
          tone: "cream",
        },
      ]}
    />
  );
}
