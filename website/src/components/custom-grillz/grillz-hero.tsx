import { Gem, ShieldCheck, Smile } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

export function GrillzHero() {
  return (
    <TreatmentHero
      label="Custom Grillz and Tooth Gems"
      title="Custom Grillz and Tooth Gems"
      accent="Crafted for Stardom"
      lead={
        <>
          pavDental crafts unique custom grillz for entertainment clients, emphasizing quality,
          style, and individuality. Each piece reflects our clients&apos; tastes and creativity.
        </>
      }
      facts={[
        { icon: Gem, text: "Choose from gold, silver, and diamond options" },
        { icon: Smile, text: "Custom-made to fit your teeth flawlessly" },
        { icon: ShieldCheck, text: "All our grillz come with a 1-year guarantee" },
      ]}
      actions={
        <>
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#contact" variant="outline">
            Request a consultation
          </ButtonLink>
        </>
      }
      note={
        <>
          <span className="block text-label text-fg">
            Tailored Elegance: Gold, Silver, and Diamond Grillz
          </span>
          <span className="mt-2 block">
            At Pav Dental, we believe in a personalized approach to dental aesthetics. Our custom
            grillz are more than just accessories; they are a reflection of your individual style
            and flair. Choose from gold, silver, and diamond options to create a look that&apos;s
            uniquely yours.
          </span>
        </>
      }
      tiles={[
        {
          src: "/images/generated/custom-grillz-hero.jpg",
          alt: "Custom gold and diamond dental grillz presented on a warm cream stone surface",
          tone: "cream",
        },
      ]}
    />
  );
}
