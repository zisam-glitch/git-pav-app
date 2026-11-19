import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";

export function OralHygieneHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Pav Dental Oral Hygiene Care"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="text-label text-terracotta">Preventative Hygiene Care</p>
          <Heading
            as="h1"
            size="hero"
            accent="Oral Hygiene Care"
            tone="terracotta"
            className="mt-3"
          >
            Pav Dental
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Healthy gums and a clean mouth are essential for a confident smile, fresh breath, and
            long lasting teeth. At Pav Dental, our professional hygiene care focuses on preventing
            gum disease, stopping bleeding gums, reducing bad breath, and maintaining strong oral
            health for life.
          </p>
          <p className="mt-4 max-w-xl text-body text-muted">
            We combine gentle hygiene treatment with education and tailored advice, so every patient
            understands how to look after their teeth at home.
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
              Our Hygiene Services (£45 – £75)
            </a>
            <a
              href="#importance"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Why Your Oral Hygiene Matters
            </a>
          </div>
        </div>

        <Media
          src="/images/generated/oral-hygiene-hero.jpg"
          alt="Warm sunlit Pav Dental oral hygiene treatment room with gentle scaling and polishing instruments"
          ratio="4 / 3"
          tone="cream"
          priority
        />
      </div>
    </Section>
  );
}
