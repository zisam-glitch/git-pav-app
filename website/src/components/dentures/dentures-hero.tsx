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

export function DenturesHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Dentures at Pav Dental"
    >
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/dentures-hero.jpg"
            ratio="4 / 3"
            tone="cream"
            className="ring-1 ring-black/8"
            priority
            alt="Custom dental prosthetic model on a warm cream ceramic tray in soft studio light"
          />
        }
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
            <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
            Dentures at Pav Dental
          </p>
          <Heading as="h1" size="hero" accent="Confident Smile" tone="terracotta" className="mt-4">
            Customized Dentures for a
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            At Pav Dental, we specialize in crafting high-quality dentures that not only look
            natural but also provide superior comfort. Our experienced team works closely with you
            to ensure your dentures are tailored to your needs, giving you a perfect fit and renewed
            confidence in your smile.
          </p>

          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
            <Tile
              tone="cream"
              className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
            >
              <p className="text-h4 text-fg tabular-nums">From £495</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Acrylic, Flexible (Valplast) &amp; Cobalt Chromium sets
              </p>
            </Tile>
            <Tile
              tone="sage"
              className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
            >
              <p className="text-h4 text-fg">Custom Fit</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Digital scanning &amp; clinic or home-visit fittings
              </p>
            </Tile>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#solutions"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Denture Solutions
            </a>
            <a
              href="#pricing"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Our Denture Prices (£495 – £1195)
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
