import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
} from "@/components/hims";

export function CosmeticHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Cosmetic Dentistry"
    >
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/cosmetic-hero.jpg"
            alt="Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <p className="text-label text-terracotta">Cosmetic Dentistry</p>
          <Heading
            as="h1"
            size="hero"
            accent="Transforming Smiles, Changing Lives"
            tone="terracotta"
            className="mt-3"
          >
            Cosmetic Dentistry:
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Welcome to your definitive guide on Cosmetic Dentistry, where science meets art to
            enhance your smile. Explore teeth whitening, porcelain veneers, and more to achieve a
            dazzling smile and transform your confidence and appearance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="#procedures" variant="outline">
              Popular Procedures
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#financing"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Costs and Financing
            </a>
            <a href="#faq" className="underline underline-offset-4 t-colors hover:text-terracotta">
              Frequently Asked Questions
            </a>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
