import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
} from "@/components/hims";

export function MobileDentistryService() {
  return (
    <Section theme="brown" width="bento" space="lg" aria-labelledby="mobile-service-heading">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/mobile-dentistry-service.jpg"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10 ring-1 ring-white/15"
            alt="Modern well-equipped Pav Dental mobile surgery prepared for a home visit"
          />
        }
      >
        <div>
          <div id="mobile-service-heading">
            <Heading as="h2" size="hero" accent="to You" tone="gold">
              We Come
            </Heading>
          </div>
          <p className="mt-5 max-w-lg text-lead text-white/85">
            We have a modern, well-equipped mobile surgery that allows us to visit you in the
            comfort of your own home.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="glass">
              Contact us
            </ButtonLink>
            <CallButton variant="glass" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
