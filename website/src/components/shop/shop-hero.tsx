import { ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

export function ShopHero({ onCategorySelect: _onCategorySelect }: ShopHeroProps) {
  return (
    <Section id="top" theme="cream" aria-label="Shop dental products">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/shop-hero.jpg"
            alt="Curated dental care products arranged on a warm surface"
            ratio="4 / 3"
            tone="sand"
            priority
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="Dentists" tone="terracotta" inline>
            Designed by
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Elevate your daily smile routine with professional teeth whitening, acoustic sonic
            brushes, and custom at-home impression kits delivered directly from our clinic in
            Bradford.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#catalog">Browse Products</ButtonLink>
            <ButtonLink href="#guarantee" variant="outline">
              Our Guarantee
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <li>Dentist-formulated</li>
            <li>Bradford clinic dispatch</li>
            <li>UK tracked delivery</li>
          </ul>
        </div>
      </SplitFeature>
    </Section>
  );
}
