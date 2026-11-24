import { ArrowUpRight } from "lucide-react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";

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

export function GrillzStyles() {
  return (
    <Section id="styles" theme="white" aria-labelledby="grillz-styles-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Custom Grillz Procedures
          </span>
          <div id="grillz-styles-heading" className="mt-4">
            <Heading size="h2-md" accent="at Its Finest" tone="terracotta" inline>
              Customization
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Mix and match metals and gems for a truly unique creation. From fully iced-out designs
            to subtle accents, we tailor each piece to your specifications. Our expert team is
            dedicated to bringing your vision to life with precision and flair.
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-pill border border-border bg-white px-4 py-2 text-small font-medium text-fg">
          Tailored Elegance: Gold, Silver, and Diamond Grillz
        </span>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {STYLES.map((item, i) => (
          <Tile
            key={item.id}
            as="article"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 border border-border p-6 md:p-8"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-pill bg-cream px-3 py-1 text-caption font-medium text-terracotta tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center rounded-pill border border-border bg-cream/60 px-3 py-0.5 text-caption font-medium text-copper">
                  {item.badge}
                </span>
              </div>
              <h3 className="mt-4 text-h4 text-fg">{item.title}</h3>
              <p className="mt-3 text-body leading-relaxed text-muted">{item.desc}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
              <BookButton variant="default" size="sm">
                Book Consultation
              </BookButton>
              <ButtonLink href="#contact" variant="ghost" size="sm" className="gap-1">
                <span>Design enquiry</span>
                <ArrowUpRight aria-hidden className="size-3.5" />
              </ButtonLink>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
