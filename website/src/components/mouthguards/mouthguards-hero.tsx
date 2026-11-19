import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function MouthguardsHero() {
  return (
    <Section id="top" theme="white" aria-label="Custom sports mouthguards">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/mouthguards-hero.jpg"
            ratio="4 / 3"
            tone="cream"
            priority
            alt="Custom sports mouthguard on a warm cream tray in soft studio light"
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="Mouthguards" tone="terracotta">
            Custom Sports
          </Heading>
          <p className="mt-5 text-lead font-medium text-fg">
            Designed for comfort, accuracy and full protection
          </p>
          <p className="mt-3 max-w-xl text-body text-muted">
            At Pav Dental, you can order a high quality custom mouthguard in the way that suits you
            best. Every mouthguard is created using precise digital or physical impressions with
            full control over colour, style and custom features.
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
