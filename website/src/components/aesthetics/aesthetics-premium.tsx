import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function AestheticsPremium() {
  return (
    <Section theme="brown" space="lg" aria-labelledby="aesthetics-premium-heading">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/aesthetics-premium.jpg"
            alt="Curated aesthetic skincare vials and clinical ceramic tray in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10 ring-1 ring-white/15"
          />
        }
      >
        <div>
          <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3.5 py-1 text-caption font-medium text-gold">
            Curated Clinical Formulations
          </span>
          <div id="aesthetics-premium-heading" className="mt-4">
            <Heading size="h2" accent="of exceptional quality" tone="gold">
              We exclusively utilise premium-grade products
            </Heading>
          </div>
          <p className="mt-5 text-lead text-white/85">
            Experience excellence with our Aesthetics services, where we use only the finest
            products to ensure exceptional results each time.
          </p>
          <p className="mt-5 border-t border-white/15 pt-5 text-body leading-relaxed text-white/75">
            Indulge in the finest aesthetic treatments you'll ever experience. Through meticulous
            research, we have curated a selection of top-notch products, ensuring utmost quality and
            satisfaction for our esteemed clients. Prepare to be impressed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Book Now</BookButton>
            <ButtonLink href="#pricing" variant="glass">
              Aesthetics Price List
            </ButtonLink>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
