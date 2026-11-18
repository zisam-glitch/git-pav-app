import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

export function DenturesHero() {
  return (
    <Section id="top" theme="white" aria-label="Dentures at Pav Dental">
      <SplitFeature
        reverse
        media={
          <Media
            ratio="4 / 3"
            tone="cream"
            priority
            alt="Custom dental prosthetic model on a warm cream ceramic tray in soft studio light"
          />
        }
      >
        <div>
          <p className="text-small font-medium text-muted">Dentures at Pav Dental</p>
          <Heading as="h1" size="hero" accent="Confident Smile" tone="terracotta" className="mt-3">
            Customized Dentures for a
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            At Pav Dental, we specialize in crafting high-quality dentures that not only look
            natural but also provide superior comfort. Our experienced team works closely with you
            to ensure your dentures are tailored to your needs, giving you a perfect fit and renewed
            confidence in your smile.
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
