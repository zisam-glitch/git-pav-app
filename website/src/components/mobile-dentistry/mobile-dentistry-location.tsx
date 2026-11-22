import {
  BookButton,
  ButtonLink,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";

export function MobileDentistryLocation() {
  return (
    <Section id="location" theme="sand" space="default" aria-labelledby="mobile-location-heading">
      <SplitFeature
        media={
          <Media
            src="/images/generated/mobile-dentistry-location.jpg"
            ratio="4 / 3"
            tone="cream"
            alt="Pav Dental Mobile outreach vehicle serving patients across the UK"
          />
        }
      >
        <div>
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Nationwide Outreach
          </span>
          <div id="mobile-location-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="coverage" tone="terracotta" inline>
              Location
            </Heading>
          </div>
          <p className="mt-4 max-w-lg text-lead text-muted">
            Pav Dental Mobile visits patients across the UK. Your Smile with Convenient Dental Care
            Right at Your Doorstep.
          </p>

          <Tile tone="white" className="mt-6 border border-border p-5">
            <p className="text-caption font-medium text-copper">Base &amp; Coverage</p>
            <p className="mt-1 text-body text-fg">
              786 Leeds Road, Bradford, BD3 9TY · Serving patients and care homes across the UK.
            </p>
          </Tile>

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
