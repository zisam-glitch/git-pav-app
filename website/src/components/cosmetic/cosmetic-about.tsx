import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function CosmeticAbout() {
  return (
    <Section theme="white" aria-labelledby="cosmetic-about-heading">
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
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Smile Aesthetics
          </span>
          <div id="cosmetic-about-heading" className="mt-4">
            <Heading size="h2-md" accent="Cosmetic Dentistry?" tone="terracotta" inline>
              What is
            </Heading>
          </div>
          <p className="mt-5 text-lead leading-relaxed text-muted">
            Cosmetic Dentistry refers to dental work that improves the appearance of teeth, gums,
            and/or bite. It primarily focuses on improvement in dental aesthetics such as color,
            position, shape, size, and overall smile appearance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Appointment</BookButton>
            <ButtonLink href="#procedures" variant="outline">
              Popular Procedures
            </ButtonLink>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
