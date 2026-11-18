import { ButtonLink, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function VacanciesHero() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            alt="Modern dental clinic workspace at Pav Dental in Bradford"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <p className="text-small font-medium text-terracotta">Careers in Bradford</p>
          <Heading as="h1" size="hero" accent="at Pav Dental" tone="terracotta" className="mt-3">
            Vacancies
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Join a growing practice in Bradford across dental nursing, general dentistry, hygiene,
            therapy, and international sponsorship.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="#roles">View Open Positions</ButtonLink>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
