import { BookButton, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function PricingHero() {
  return (
    <Section id="top" theme="white" aria-label="Dental pricing and finance">
      <SplitFeature
        reverse
        media={
          <Media
            alt="Warm sunlit dental consultation desk with treatment guide and ceramic cup on cream surface"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="for it all at once." tone="terracotta">
            You don&apos;t have to Pay
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            With our 0% interest dental finance, treatments from £99 can be started today and paid
            over convenient monthly instalments.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
