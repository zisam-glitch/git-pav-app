import { BookButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const STYLES: readonly BenefitItem[] = [
  {
    title: "Gold Grillz: Timeless Luxury",
    body: "Our gold grillz exude classic elegance. Whether you prefer yellow, white, or rose gold, we offer a variety of karat options to match your taste. Gold grillz are perfect for adding a touch of timeless sophistication to your smile.",
    media: { alt: "Gold dental grillz in warm studio light", tone: "sand" },
  },
  {
    title: "Silver Grillz: Sleek and Modern",
    body: "Opt for the sleek appeal of silver grillz. Known for their modern and versatile look, silver grillz are a popular choice for those seeking a chic, understated style that complements any outfit or occasion.",
    media: { alt: "Silver dental grillz on a soft cream surface", tone: "cream" },
  },
  {
    title: "Diamond Grillz: Dazzling Brilliance",
    body: "Elevate your smile with the ultimate statement of luxury - diamond grillz. Our diamonds are meticulously set to maximize sparkle and impact, ensuring your smile catches every light and eye in the room.",
    media: { alt: "Diamond-set dental grillz catching the light", tone: "sage" },
  },
  {
    title: "Perfect Fit, Guaranteed",
    body: "Comfort is key. Our grillz are custom-made to fit your teeth flawlessly, ensuring maximum comfort without compromising on style",
    media: { alt: "A custom-fitted grillz mould beside dental tools", tone: "sand" },
  },
];

export function GrillzStyles() {
  return (
    <BenefitCards
      id="styles"
      theme="white"
      title="Customization"
      accent="at Its Finest"
      lead={
        <>
          <span className="mb-2 block text-label text-fg">Custom Grillz Procedures</span>
          Mix and match metals and gems for a truly unique creation. From fully iced-out designs to
          subtle accents, we tailor each piece to your specifications. Our expert team is dedicated
          to bringing your vision to life with precision and flair.
        </>
      }
      action={<BookButton>Book Now</BookButton>}
      items={STYLES}
      columns={4}
    />
  );
}
