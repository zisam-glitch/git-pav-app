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
    <Section id="treatments" theme="cream" aria-labelledby="aesthetics-treatments-heading">
      <div className="max-w-2xl">
        <div id="aesthetics-treatments-heading">
          <Heading size="h2-md" accent="Treatments" tone="terracotta" inline>
            Aesthetics
          </Heading>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TREATMENTS.map((item, index) => (
          <Tile
            key={item.id}
            as="article"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 p-6 md:p-7"
          >
            <div>
              <span className="text-small font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-h4 text-fg">{item.title}</h3>
              <p className="mt-3 text-body text-muted">{item.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <BookButton variant="outline" size="sm">
                Book Now
              </BookButton>
              <ButtonLink href="#pricing" variant="ghost" size="sm">
                Price List
              </ButtonLink>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
