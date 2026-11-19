import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
} from "@/components/hims";

export function AestheticsHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Pav Dental Aesthetics"
    >
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/aesthetics-hero.jpg"
            alt="Warm sunlit facial aesthetics consultation room at Pav Dental in Bradford"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <p className="text-label text-terracotta">Pav Dental Aesthetics</p>
          <Heading as="h1" size="hero" accent="Perfection?" tone="terracotta" className="mt-3">
            Seeking
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            The Award-Winning Bradford Dental and Aesthetic Clinic: Excellence in Dental and
            Aesthetic Care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="#pricing" variant="outline">
              Aesthetics Price List
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#treatments"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Aesthetics Treatments
            </a>
            <a
              href="#safety"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              How We are Keeping You Safe
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
