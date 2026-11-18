import { BookButton, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function Hero() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            alt="Warm sunlit Pav Dental treatment room in Bradford"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <p className="text-small font-medium text-terracotta">Bradford · Our Story</p>
          <Heading
            as="h1"
            size="hero"
            accent="Care and Innovation"
            tone="terracotta"
            className="mt-3"
          >
            A Legacy of
          </Heading>
          <p className="mt-5 text-lead text-muted">
            Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
            it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
            passionate believer that dentistry could – and should – extend beyond traditional
            practice, providing unparalleled convenience and accessibility.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
