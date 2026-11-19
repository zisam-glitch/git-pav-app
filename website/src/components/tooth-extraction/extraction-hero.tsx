import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";

export function ExtractionHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Pav Dental: Same day Tooth Extraction"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="text-label text-terracotta">Urgent &amp; Surgical Care</p>
          <Heading
            as="h1"
            size="hero"
            accent="Same day Tooth Extraction"
            tone="terracotta"
            className="mt-3"
          >
            Pav Dental:
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            At Pav Dental, our experienced oral surgeons are dedicated to providing you with the
            highest standard of care. Utilizing the latest techniques and technologies, we ensure a
            comfortable and effective treatment experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink to="/contact-us" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#pricing"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Our Tooth Extraction Prices (£95 – £295)
            </a>
            <a
              href="#post-op"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Post Operative Instructions
            </a>
          </div>
        </div>

        <Media
          src="/images/generated/tooth-extraction-hero.jpg"
          alt="Serene Pav Dental oral surgery suite in warm natural light prepared for same-day tooth extraction"
          ratio="4 / 3"
          tone="cream"
          priority
        />
      </div>
    </Section>
  );
}
