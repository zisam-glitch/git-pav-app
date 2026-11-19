import { BookButton, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function GeneralDentistryHero() {
  return (
    <Section id="top" theme="white" aria-label="General dentistry services">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/general-dentistry-hero.jpg"
            alt="Minimalist dental examination mirror and ceramic care vessel in warm natural light"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="Gateway to Lifelong Oral Health" tone="terracotta">
            General Dentistry: Your
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Welcome to your guide to General Dentistry, covering check-ups to fillings. Discover how
            it maintains and improves your dental health for lifelong healthy smiles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
