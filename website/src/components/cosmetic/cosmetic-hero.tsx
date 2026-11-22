import { Gem, Sparkles, Smile } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { EagerTreatmentHero as TreatmentHero } from "@/components/hims/eager-treatment-hero";

export function CosmeticHero() {
  return (
    <TreatmentHero
      label="Cosmetic Dentistry"
      title="Cosmetic Dentistry:"
      accent="Transforming Smiles, Changing Lives"
      lead="Welcome to your definitive guide on Cosmetic Dentistry, where science meets art to enhance your smile. Explore teeth whitening, porcelain veneers, and more to achieve a dazzling smile and transform your confidence and appearance."
      facts={[
        { icon: Sparkles, text: "Teeth Whitening" },
        { icon: Gem, text: "Porcelain Veneers" },
        { icon: Smile, text: "Dental Implants" },
      ]}
      actions={
        <>
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#procedures" variant="outline">
            Popular Procedures
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a
            href="#financing"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Costs and Financing
          </a>
          <a
            href="#faq"
            className="inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Frequently Asked Questions
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/cosmetic-hero.jpg",
          alt: "Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light",
          tone: "cream",
        },
        {
          src: "/images/generated/cosmetic-about.jpg",
          alt: "Bright minimalist dental consultation suite prepared for smile aesthetic planning",
          tone: "sand",
        },
        {
          src: "/images/generated/cosmetic-showcase.jpg",
          alt: "Cosmetic dental ceramic models and porcelain shade tabs in warm studio light",
          tone: "brown",
        },
      ]}
    />
  );
}
