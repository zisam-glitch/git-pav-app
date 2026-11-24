import { ArrowUpRight } from "lucide-react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";

const TREATMENTS = [
  {
    id: "microneedling",
    title: "Microneedling",
    desc: "We offer microneedling as a safe and effective treatment to help improve the overall health and appearance of your skin.",
  },
  {
    id: "botox",
    title: "Botox",
    desc: "Botox is a non-surgical treatment that smooths out wrinkles and fine lines, giving you a more youthful appearance.",
  },
  {
    id: "dermal-fillers",
    title: "Dermal fillers",
    desc: "Dermal fillers are used to add volume and fullness to areas of the face that have lost volume due to aging or other factors.",
  },
  {
    id: "chemical-peels",
    title: "Chemical peels",
    desc: "Chemical peels are an effective way to rejuvenate the skin by removing dead skin cells and promoting the growth of new, healthy skin.",
  },
  {
    id: "lip-enhancement",
    title: "Lip enhancement",
    desc: "Our lip enhancement treatments are designed to add volume and definition to your lips, giving you a fuller and more youthful appearance.",
  },
  {
    id: "skin-rejuvenation",
    title: "Skin Rejuvenation",
    desc: "Our skin rejuvenation treatments are designed to reduce the appearance of fine lines, wrinkles, and other signs of aging.",
  },
] as const;

export function AestheticsTreatments() {
  return (
    <Section id="treatments" theme="white" aria-labelledby="aesthetics-treatments-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Treatment Menu
          </span>
          <div id="aesthetics-treatments-heading" className="mt-4">
            <Heading size="h2-md" accent="Treatments" tone="terracotta" inline>
              Aesthetics
            </Heading>
          </div>
        </div>
        <ButtonLink href="#pricing" variant="outline" size="sm" className="w-fit">
          Aesthetics Price List
        </ButtonLink>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TREATMENTS.map((item, index) => (
          <Tile
            key={item.id}
            as="article"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 p-6 md:p-8"
          >
            <div>
              <span className="inline-flex items-center rounded-pill bg-cream px-3 py-1 text-caption font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h4 text-fg">{item.title}</h3>
              <p className="mt-3 text-body leading-relaxed text-muted">{item.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
              <BookButton variant="default" size="sm">
                Book Now
              </BookButton>
              <ButtonLink href="#pricing" variant="ghost" size="sm" className="gap-1">
                <span>Price List</span>
                <ArrowUpRight aria-hidden className="size-3.5" />
              </ButtonLink>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
