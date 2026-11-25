import { BookButton, CinematicHero } from "@/components/hims";

export function GrillzHero() {
  return (
    <CinematicHero
      label="Custom Grillz and Tooth Gems"
      image="/images/generated/custom-grillz-hero.jpg"
      alt="Custom gold and diamond dental grillz presented on a warm cream stone surface"
      tags={["Bespoke Dental Jewellery", "Crafted for Stardom"]}
      left="Custom Grillz"
      right="and Tooth Gems"
      lead={
        <>
          <p>
            pavDental crafts unique custom grillz for entertainment clients, emphasizing quality,
            style, and individuality. Each piece reflects our clients&apos; tastes and creativity.
          </p>
          <p className="mt-3 text-[15px] text-white/70">
            At Pav Dental, we believe in a personalized approach to dental aesthetics. Our custom
            grillz are more than just accessories; they are a reflection of your individual style
            and flair. Choose from gold, silver, and diamond options to create a look that&apos;s
            uniquely yours.
          </p>
        </>
      }
      promo={
        <p>
          <span className="font-medium">Tailored Elegance: Gold, Silver, and Diamond Grillz</span>
          <span className="block text-[15px] text-white/70">
            One Year Guarantee · Worldwide delivery
          </span>
        </p>
      }
      promoAction={<BookButton variant="gold">Book Now</BookButton>}
    />
  );
}
