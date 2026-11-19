import { BookButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function CosmeticAbout() {
  return (
    <Section theme="cream" aria-labelledby="cosmetic-about-heading">
      <SplitFeature
        media={
          <Media
            src="/images/generated/cosmetic-about.jpg"
            alt="Bright minimalist dental consultation suite prepared for smile aesthetic planning"
            ratio="4 / 3"
            tone="sand"
          />
        }
      >
        <div>
          <div id="cosmetic-about-heading">
            <Heading size="h2-md" accent="Cosmetic Dentistry?" tone="terracotta" inline>
              What is
            </Heading>
          </div>
          <p className="mt-5 text-lead text-muted">
            Cosmetic Dentistry refers to dental work that improves the appearance of teeth, gums,
            and/or bite. It primarily focuses on improvement in dental aesthetics such as color,
            position, shape, size, and overall smile appearance.
          </p>
          <div className="mt-8">
            <BookButton>Book Appointment</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
