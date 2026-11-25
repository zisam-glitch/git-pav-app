import { BookButton, ButtonLink, Section } from "@/components/hims";

const STYLES = [
  {
    id: "gold",
    badge: "Yellow, White & Rose Karats",
    title: "Gold Grillz: Timeless Luxury",
    desc: "Our gold grillz exude classic elegance. Whether you prefer yellow, white, or rose gold, we offer a variety of karat options to match your taste. Gold grillz are perfect for adding a touch of timeless sophistication to your smile.",
  },
  {
    id: "silver",
    badge: "Modern & Versatile",
    title: "Silver Grillz: Sleek and Modern",
    desc: "Opt for the sleek appeal of silver grillz. Known for their modern and versatile look, silver grillz are a popular choice for those seeking a chic, understated style that complements any outfit or occasion.",
  },
  {
    id: "diamond",
    badge: "Precision-Set Brilliance",
    title: "Diamond Grillz: Dazzling Brilliance",
    desc: "Elevate your smile with the ultimate statement of luxury - diamond grillz. Our diamonds are meticulously set to maximize sparkle and impact, ensuring your smile catches every light and eye in the room.",
  },
  {
    id: "fit",
    badge: "Custom Digital Impression",
    title: "Perfect Fit, Guaranteed",
    desc: "Comfort is key. Our grillz are custom-made to fit your teeth flawlessly, ensuring maximum comfort without compromising on style",
  },
] as const;

const IMAGES = [
  { src: "/images/generated/grillz-gold.jpg", pos: "50% 50%" },
  { src: "/images/generated/grillz-silver.jpg", pos: "50% 50%" },
  { src: "/images/generated/grillz-diamond.jpg", pos: "50% 50%" },
  { src: "/images/generated/grillz-fit.jpg", pos: "50% 50%" },
];
const KINDS = ["GOLD", "SILVER", "DIAMOND", "FIT"];

export function GrillzStyles() {
  return (
    <Section
      id="styles"
      theme="white"
      className="bg-[#f6f3ec]"
      aria-labelledby="grillz-styles-heading"
    >
      <div className="max-w-3xl">
        <p className="font-mono text-[13px] tracking-wide text-[#8a4242] uppercase">
          Custom Grillz Procedures
        </p>
        <h2
          id="grillz-styles-heading"
          className="mt-3 text-[clamp(34px,4.4vw,60px)] leading-[1.04] font-normal tracking-[-0.03em] text-[#2a1c12]"
        >
          Customization at Its Finest
        </h2>
        <p className="mt-5 text-[18px] leading-[1.45] text-[#55565a]">
          Mix and match metals and gems for a truly unique creation. From fully iced-out designs to
          subtle accents, we tailor each piece to your specifications. Our expert team is dedicated
          to bringing your vision to life with precision and flair.
        </p>
      </div>
      <ul className="mt-12 grid list-none gap-3 md:grid-cols-2 lg:grid-cols-4">
        {STYLES.map((item, i) => (
          <li key={item.id} className="flex flex-col rounded-[24px] bg-white p-5">
            <p className="font-mono text-[12px] tracking-wide text-[#8b8d92]">
              Lifestyle: {item.badge}
            </p>
            <div className="mt-4 overflow-hidden rounded-[16px] bg-[#efe9dd]">
              <img
                src={IMAGES[i].src}
                alt=""
                aria-hidden
                loading="lazy"
                style={{ objectPosition: IMAGES[i].pos }}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <p className="mt-5 font-mono text-[12px] tracking-wide text-[#55565a]">▪ {KINDS[i]}</p>
            <h3 className="mt-1 text-[24px] leading-[1.12] font-normal tracking-[-0.01em] text-[#3a1f1f]">
              {item.title}
            </h3>
            <p className="mt-3 flex-1 text-[14px] leading-[1.5] text-[#6b6b70]">{item.desc}</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <BookButton size="sm" className="bg-[#efe6dc] text-[#2a1c12] hover:bg-[#e6dacb]">
                Book Consultation
              </BookButton>
              <ButtonLink href="#contact" variant="outline" size="sm">
                Get a design quote
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
