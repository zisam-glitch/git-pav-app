import { BookButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function AestheticsPremium() {
  return (
    <Section theme="brown" space="lg" aria-labelledby="aesthetics-premium-heading">
      <SplitFeature
        reverse
        media={
          <Media
            alt="Curated aesthetic skincare vials and clinical ceramic tray in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10"
          />
        }
      >
        <div>
          <div id="aesthetics-premium-heading">
            <Heading size="h2-md" accent="of exceptional quality" tone="gold">
              We exclusively utilise premium-grade products
            </Heading>
          </div>
          <p className="mt-5 text-lead text-white/80">
            Experience excellence with our Aesthetics services, where we use only the finest
            products to ensure exceptional results each time.
          </p>
          <p className="mt-4 text-body text-white/80">
            Indulge in the finest aesthetic treatments you'll ever experience. Through meticulous
            research, we have curated a selection of top-notch products, ensuring utmost quality and
            satisfaction for our esteemed clients. Prepare to be impressed.
          </p>
          <div className="mt-8">
            <BookButton variant="gold">Book Now</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
