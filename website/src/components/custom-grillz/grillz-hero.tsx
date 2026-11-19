import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
} from "@/components/hims";

export function GrillzHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Custom Grillz and Tooth Gems"
    >
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/custom-grillz-hero.jpg"
            alt="Custom gold and diamond dental grillz presented on a warm cream stone surface"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="Crafted for Stardom" tone="terracotta">
            Custom Grillz and Tooth Gems
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            pavDental crafts unique custom grillz for entertainment clients, emphasizing quality,
            style, and individuality. Each piece reflects our clients&apos; tastes and creativity.
          </p>
          <p className="mt-3 max-w-xl text-body text-muted">
            At Pav Dental, we believe in a personalized approach to dental aesthetics. Our custom
            grillz are more than just accessories; they are a reflection of your individual style
            and flair. Choose from gold, silver, and diamond options to create a look that&apos;s
            uniquely yours.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Request a consultation
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#styles"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Tailored Elegance: Gold, Silver, and Diamond Grillz
            </a>
            <a
              href="#guarantee"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              One Year Guarantee
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
