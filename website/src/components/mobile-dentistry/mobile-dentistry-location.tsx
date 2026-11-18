import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function MobileDentistryLocation() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        media={
          <Media
            ratio="4 / 3"
            tone="cream"
            alt="Pav Dental Mobile outreach vehicle serving patients across the UK"
          />
        }
      >
        <div>
          <Heading as="h2" size="h2-md" accent="coverage" tone="terracotta" inline>
            Location
          </Heading>
          <p className="mt-4 max-w-lg text-lead text-muted">
            Pav Dental Mobile visits patients across the UK. Your Smile with Convenient Dental Care
            Right at Your Doorstep.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
