import { Droplets, Sparkles, Syringe } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { EagerTreatmentHero as TreatmentHero } from "@/components/hims/eager-treatment-hero";

export function AestheticsHero() {
  return (
    <TreatmentHero
      label="Pav Dental Aesthetics"
      badge="Pav Dental Aesthetics"
      title="Seeking"
      accent="Perfection?"
      lead="The Award-Winning Bradford Dental and Aesthetic Clinic: Excellence in Dental and Aesthetic Care."
      facts={[
        { icon: Syringe, text: "Botox" },
        { icon: Droplets, text: "Dermal fillers" },
        { icon: Sparkles, text: "Skin Rejuvenation" },
      ]}
      actions={
        <>
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#pricing" variant="outline">
            Aesthetics Price List
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a
            href="#treatments"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Aesthetics Treatments
          </a>
          <a
            href="#safety"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            How We are Keeping You Safe
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/aesthetics-hero.jpg",
          alt: "Warm sunlit facial aesthetics consultation room at Pav Dental in Bradford",
          tone: "cream",
        },
        {
          src: "/images/generated/aesthetics-premium.jpg",
          alt: "Curated aesthetic skincare vials and clinical ceramic tray in warm studio light",
          tone: "brown",
        },
      ]}
    />
  );
}
