import { BookButton, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function GeneralDentistryHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="General dentistry services"
    >
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/general-dentistry-hero.jpg"
            alt="Minimalist dental examination mirror and ceramic care vessel in warm natural light"
            ratio="4 / 3"
            tone="cream"
            className="ring-1 ring-black/8"
            priority
          />
        }
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
            <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
            Preventative &amp; Restorative Care
          </p>
          <Heading
            as="h1"
            size="hero"
            accent="Gateway to Lifelong Oral Health"
            tone="terracotta"
            className="mt-4"
          >
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
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#pricing"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Treatment Prices
            </a>
            <a
              href="#services"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Services Offered
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
