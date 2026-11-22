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

export function MouthguardsHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Custom sports mouthguards"
    >
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
          <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
            Athletic &amp; Everyday Oral Protection
          </span>
          <Heading
            as="h1"
            size="hero"
            accent="Mouthguards"
            tone="terracotta"
            className="mt-4"
          >
            Custom Sports
          </Heading>
          <p className="mt-5 text-lead font-medium text-fg">
            Designed for comfort, accuracy and full protection
          </p>
          <p className="mt-3 max-w-xl text-body leading-relaxed text-muted">
            At Pav Dental, you can order a high quality custom mouthguard in the way that suits you
            best. Every mouthguard is created using precise digital or physical impressions with
            full control over colour, style and custom features.
          </p>

          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            <Tile tone="cream" className="border border-border/60 p-3.5">
              <p className="text-caption font-medium text-copper">Impressions</p>
              <p className="mt-1 text-label text-fg">Digital or Mould Kit</p>
            </Tile>
            <Tile tone="sage" className="border border-border/60 p-3.5">
              <p className="text-caption font-medium text-copper">Customisation</p>
              <p className="mt-1 text-label text-fg">32 Colour Swatches</p>
            </Tile>
            <Tile tone="cream" className="border border-border/60 p-3.5">
              <p className="text-caption font-medium text-copper">Personalisation</p>
              <p className="mt-1 text-label text-fg">Name, Team &amp; Logo</p>
            </Tile>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
            <a
              href="#ordering"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              How to Order Your Mouthguard
            </a>
            <a
              href="#colour"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Choose Your Colour
            </a>
            <a
              href="#personalisation"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Add Personalisation
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
