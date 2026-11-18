import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";

export function GrillzPricing() {
  return (
    <Section id="guarantee" theme="brown" space="lg">
      <SplitFeature
        media={
          <Media
            alt="Custom-crafted dental grillz presentation box in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10"
          />
        }
      >
        <div>
          <Heading size="hero" accent="Guarantee" tone="gold">
            One Year
          </Heading>
          <p className="mt-5 text-lead text-white/80">
            We stand by our craftsmanship. All our grillz come with a 1-year guarantee, ensuring
            your satisfaction and peace of mind.
          </p>

          <div className="mt-8 grid gap-4">
            <Tile tone="glass" className="p-6">
              <h3 className="text-h4 text-white">A Dazzling Smile, Just a Click Away!</h3>
              <p className="mt-2 text-body text-white/80">
                At Pav Dental, we believe in making luxury accessible. That&apos;s why we&apos;re
                thrilled to offer our exclusive grillz with worldwide delivery. No matter where you
                are, you can have custom-crafted, dazzling grillz delivered right to your doorstep.
              </p>
            </Tile>

            <Tile tone="glass" className="p-6">
              <h3 className="text-h4 text-white">Shine in Your Unique Way</h3>
              <p className="mt-2 text-body text-white/80">
                Ready to create your signature grillz? Contact Pav Dental today for a consultation.
                Our experts are excited to help you design a piece that&apos;s as unique as you are.
              </p>
            </Tile>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Book Now</BookButton>
            <ButtonLink href="#contact" variant="glass">
              Get a design quote
            </ButtonLink>
            <CallButton variant="glass" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
