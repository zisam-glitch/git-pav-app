import { ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { HERO_CATEGORY_SLUGS, SHOP_CATEGORIES } from "./shop-catalog-data";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

const HERO_TILES = HERO_CATEGORY_SLUGS.map((slug) =>
  SHOP_CATEGORIES.find((cat) => cat.slug === slug),
).filter((cat): cat is (typeof SHOP_CATEGORIES)[number] => Boolean(cat));

export function ShopHero({ onCategorySelect: _onCategorySelect }: ShopHeroProps) {
  return (
    <>
      <Section id="top" theme="cream" aria-label="Shop dental products">
        <SplitFeature
          reverse
          media={
            <Media
              src="/images/generated/shop-hero.jpg"
              alt="Curated dental care products arranged on a warm cream studio surface"
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
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#catalog">Browse Products</ButtonLink>
            </div>
          </div>
        </SplitFeature>
      </Section>

      {/* Hims category tile row (hair-loss.html band 1): picture cards, 3 across from 1024px */}
      <Section theme="white" space="sm" aria-label="Shop by category">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_TILES.map((tile) => (
            <li key={tile.slug}>
              <Link
                to="/category/$slug"
                params={{ slug: tile.slug }}
                className="group flex h-full flex-col gap-5 rounded-md bg-black/3 p-6 text-fg t-lift hover:bg-white"
              >
                <span className="block overflow-hidden rounded-md">
                  <span className="block transition-transform duration-200 ease-in-out motion-safe:group-hover:scale-[1.03]">
                    <Media src={tile.image} alt={tile.name} ratio="4 / 3" tone="sand" />
                  </span>
                </span>
                <span className="flex items-start justify-between gap-3 text-h4">
                  {tile.name}
                  <ChevronRight aria-hidden className="mt-1 size-5 shrink-0" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
