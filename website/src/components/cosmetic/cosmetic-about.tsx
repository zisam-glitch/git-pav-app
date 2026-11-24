import { BookButton, ButtonLink, ExplainCards, Section, SectionHead } from "@/components/hims";

export function CosmeticAbout() {
  return (
    <Section id="financing" theme="white" aria-labelledby="cosmetic-about-heading">
      <SectionHead id="cosmetic-about-heading" title="What is Cosmetic Dentistry?" />
      <div className="mt-10">
        <ExplainCards
          items={[
            {
              title: "What is Cosmetic Dentistry?",
              image: "/images/generated/cosmetic-about.jpg",
              alt: "Bright minimalist dental consultation suite prepared for smile aesthetic planning",
              text: (
                <>
                  Cosmetic Dentistry refers to dental work that improves the appearance of teeth,
                  gums, and/or bite. It primarily focuses on improvement in dental aesthetics such
                  as color, position, shape, size, and overall smile appearance.
                </>
              ),
              action: <BookButton>Book Appointment</BookButton>,
            },
            {
              title: "Costs and Financing",
              image: "/images/generated/cosmetic-showcase.jpg",
              alt: "Cosmetic dental ceramic models and porcelain shade tabs in warm studio light",
              text: (
                <>
                  The cost of cosmetic dentistry varies widely depending on the type of procedure,
                  the expertise of the dentist, and geographic location. While many cosmetic
                  procedures are not covered by dental insurance, financing options are often
                  available.
                </>
              ),
              action: (
                <ButtonLink to="/pricing" variant="outline">
                  View Pricing
                </ButtonLink>
              ),
            },
          ]}
        />
      </div>
    </Section>
  );
}
