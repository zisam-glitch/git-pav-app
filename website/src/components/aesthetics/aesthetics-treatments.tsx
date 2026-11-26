import { BookButton, ButtonLink, CardRail, Section, SectionHead } from "@/components/hims";

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
      <SectionHead
        id="aesthetics-treatments-heading"
        label="Treatment menu"
        title="Aesthetics Treatments"
        action={<ButtonLink href="#pricing">Aesthetics Price List</ButtonLink>}
      />
      <div className="mt-10">
        <CardRail
          label="Aesthetics Treatments"
          items={TREATMENTS.map((item, i) => ({
            label: String(i + 1).padStart(2, "0"),
            title: item.title,
            text: item.desc,
            action: (
              <div className="flex flex-wrap gap-2">
                <BookButton size="sm">Book Now</BookButton>
                <ButtonLink href="#pricing" variant="outline" size="sm">
                  Price List
                </ButtonLink>
              </div>
            ),
          }))}
        />
      </div>
    </Section>
  );
}
