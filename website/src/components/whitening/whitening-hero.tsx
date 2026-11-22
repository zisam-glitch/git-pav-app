import { Building2, House, Sparkles } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function WhiteningHero() {
  return (
    <TreatmentHero
      label="Teeth whitening services"
      title="Designed by Dentists"
      accent="Developed for You"
      lead="We offer a carefully curated selection of whitening ranges designed to effectively remove stains and discoloration, giving you the confidence to flash your pearly whites."
      facts={[
        { icon: Sparkles, text: "Whitening Strips - £65" },
        { icon: House, text: "Home Teeth Whitening - £295" },
        { icon: Building2, text: "Home & In Office Whitening - £495" },
      ]}
      actions={
        <>
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#products" variant="outline">
            Explore ranges
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a
            href="#comparison-matrix"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Compare treatments
          </a>
          <a
            href="#consent"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Informed Consent for Tooth Whitening
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/whitening-hero.jpg",
          alt: "Bright minimalist teeth whitening consultation room and care vessels in warm sunlight",
          tone: "sand",
        },
      ]}
    />
  );
}
