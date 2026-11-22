import { PoundSterling, ShieldCheck, Smile } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function DenturesHero() {
  return (
    <TreatmentHero
      label="Dentures at Pav Dental"
      badge="Dentures at Pav Dental"
      title="Customized Dentures for a"
      accent="Confident Smile"
      lead="At Pav Dental, we specialize in crafting high-quality dentures that not only look natural but also provide superior comfort. Our experienced team works closely with you to ensure your dentures are tailored to your needs, giving you a perfect fit and renewed confidence in your smile."
      facts={[
        {
          icon: PoundSterling,
          text: "Acrylic £495, Flexible (Valplast) £795, Cobalt Chromium £1195",
        },
        { icon: Smile, text: "We Are The Dentists That Come To You." },
        { icon: ShieldCheck, text: "Free consultation with GDC-registered dentists" },
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
            href="#solutions"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Denture Solutions
          </a>
          <a
            href="#pricing"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Our Denture Prices
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/dentures-hero.jpg",
          alt: "Custom dental prosthetic model on a warm cream ceramic tray in soft studio light",
          tone: "cream",
        },
        {
          src: "/images/generated/dentures-showcase.jpg",
          alt: "Acrylic and flexible denture craftsmanship on a calm dark studio surface",
          tone: "brown",
        },
      ]}
    />
  );
}
