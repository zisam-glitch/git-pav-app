import { BookButton, Heading, Section, Tile } from "@/components/hims";

const STYLES = [
  {
    id: "gold",
    title: "Gold Grillz: Timeless Luxury",
    desc: "Our gold grillz exude classic elegance. Whether you prefer yellow, white, or rose gold, we offer a variety of karat options to match your taste. Gold grillz are perfect for adding a touch of timeless sophistication to your smile.",
  },
  {
    id: "silver",
    title: "Silver Grillz: Sleek and Modern",
    desc: "Opt for the sleek appeal of silver grillz. Known for their modern and versatile look, silver grillz are a popular choice for those seeking a chic, understated style that complements any outfit or occasion.",
  },
  {
    id: "diamond",
    title: "Diamond Grillz: Dazzling Brilliance",
    desc: "Elevate your smile with the ultimate statement of luxury - diamond grillz. Our diamonds are meticulously set to maximize sparkle and impact, ensuring your smile catches every light and eye in the room.",
  },
  {
    id: "fit",
    title: "Perfect Fit, Guaranteed",
    desc: "Comfort is key. Our grillz are custom-made to fit your teeth flawlessly, ensuring maximum comfort without compromising on style",
  },
] as const;

export function GrillzStyles() {
  return (
    <Section id="styles" theme="cream">
      <div className="max-w-2xl">
        <p className="text-small font-medium text-terracotta">Custom Grillz Procedures</p>
        <Heading size="h2-md" accent="at Its Finest" tone="terracotta" inline className="mt-2">
          Customization
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Mix and match metals and gems for a truly unique creation. From fully iced-out designs to
          subtle accents, we tailor each piece to your specifications. Our expert team is dedicated
          to bringing your vision to life with precision and flair.
        </p>
        <p className="mt-3 text-small font-medium text-fg">
          Tailored Elegance: Gold, Silver, and Diamond Grillz
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {STYLES.map((item, i) => (
          <Tile
            key={item.id}
            as="article"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 p-6 md:p-8"
          >
            <div>
              <span className="text-small font-medium text-terracotta tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-h4 text-fg">{item.title}</h3>
              <p className="mt-3 text-body text-muted">{item.desc}</p>
            </div>
            <div>
              <BookButton variant="outline" size="sm">
                Book Consultation
              </BookButton>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
