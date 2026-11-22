import { Clock, Palette, ScanLine } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { EagerTreatmentHero as TreatmentHero } from "@/components/hims/eager-treatment-hero";

export function MouthguardsHero() {
  return (
    <TreatmentHero
      label="Custom sports mouthguards"
      badge="Designed for comfort, accuracy and full protection"
      title="Custom Sports"
      accent="Mouthguards"
      lead="At Pav Dental, you can order a high quality custom mouthguard in the way that suits you best. Every mouthguard is created using precise digital or physical impressions with full control over colour, style and custom features."
      facts={[
        { icon: ScanLine, text: "Digital or mould kit options" },
        { icon: Palette, text: "Choose Your Colour" },
        { icon: Clock, text: "Fast turnaround" },
      ]}
      actions={
        <>
          <BookButton>Make an Appointment</BookButton>
          <ButtonLink href="#contact" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a
            href="#ordering"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            How to Order Your Mouthguard
          </a>
          <a
            href="#colour"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Choose Your Colour
          </a>
          <a
            href="#personalisation"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Add Personalisation
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/mouthguards-hero.jpg",
          alt: "Custom sports mouthguard on a warm cream tray in soft studio light",
          tone: "cream",
        },
      ]}
    />
  );
}
