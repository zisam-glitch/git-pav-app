import { Droplet, Droplets, FlaskConical, Heart, Sun, Syringe } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const TREATMENTS: readonly BenefitItem[] = [
  {
    title: "Microneedling",
    body: "We offer microneedling as a safe and effective treatment to help improve the overall health and appearance of your skin.",
    icon: Droplet,
  },
  {
    title: "Botox",
    body: "Botox is a non-surgical treatment that smooths out wrinkles and fine lines, giving you a more youthful appearance.",
    icon: Syringe,
  },
  {
    title: "Dermal fillers",
    body: "Dermal fillers are used to add volume and fullness to areas of the face that have lost volume due to aging or other factors.",
    icon: Droplets,
  },
  {
    title: "Chemical peels",
    body: "Chemical peels are an effective way to rejuvenate the skin by removing dead skin cells and promoting the growth of new, healthy skin.",
    icon: FlaskConical,
  },
  {
    title: "Lip enhancement",
    body: "Our lip enhancement treatments are designed to add volume and definition to your lips, giving you a fuller and more youthful appearance.",
    icon: Heart,
  },
  {
    title: "Skin Rejuvenation",
    body: "Our skin rejuvenation treatments are designed to reduce the appearance of fine lines, wrinkles, and other signs of aging.",
    icon: Sun,
  },
];

export function AestheticsTreatments() {
  return (
    <BenefitCards
      id="treatments"
      theme="white"
      title="Aesthetics"
      accent="Treatments"
      action={
        <>
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#pricing" variant="outline">
            Aesthetics Price List
          </ButtonLink>
        </>
      }
      items={TREATMENTS}
      columns={3}
    />
  );
}
