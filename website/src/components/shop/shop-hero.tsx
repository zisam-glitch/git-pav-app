import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ACCENT_TEXT, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";
import { cn } from "@/lib/utils";
import { HERO_CATEGORY_SLUGS, SHOP_CATEGORIES } from "./shop-catalog-data";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

const HERO_TILES = HERO_CATEGORY_SLUGS.map((slug) =>
  SHOP_CATEGORIES.find((cat) => cat.slug === slug),
).filter((cat): cat is (typeof SHOP_CATEGORIES)[number] => Boolean(cat));

export function ShopHero({ onCategorySelect: _onCategorySelect }: ShopHeroProps) {
  return (
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
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-fg">
            Pav Dental Clinic Store · Bradford
          </span>
          <Heading as="h1" size="hero" accent="Dentists" tone="terracotta" inline className="mt-4">
            Designed by
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Clinician-selected whitening strips, acoustic sonic brushes, fluoride enamel care, and
            denture hygiene essentials—dispatched directly from our registered clinic at 786 Leeds
            Road, Bradford.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#catalog">Browse Products</ButtonLink>
            <ButtonLink href="#clinical-guarantee" variant="outline">
              Delivery &amp; Returns
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <li>GDC-registered clinic selection</li>
            <li>Free UK tracked delivery over £40</li>
            <li>14-day UK returns on unopened items</li>
          </ul>
        </div>
      </SplitFeature>

      {/* Hims 4-column category shortcut tiles with 400ms colour-gradient cross-fade on hover */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {HERO_TILES.map((tile) => (
          <Link
            key={tile.slug}
            to="/category/$slug"
            params={{ slug: tile.slug }}
            data-hover-tone={tile.hoverTone}
            className="hero-tile group flex min-h-[196px] flex-col justify-between rounded-xl border border-border p-5"
          >
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="hero-tile-title text-nav-lg font-[470] text-fg">
                {tile.shortTitle}{" "}
                <span className={cn("hero-tile-accent", ACCENT_TEXT[tile.accentTone])}>
                  {tile.accentWord}
                </span>
              </span>
              <ChevronRight aria-hidden className="hero-tile-icon size-4 shrink-0 text-fg" />
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
              <span className="hero-tile-title line-clamp-2 max-w-[58%] text-caption text-muted">
                {tile.description}
              </span>
              <span className="hero-tile-media block size-20 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="eager"
                  className="size-full object-cover"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
