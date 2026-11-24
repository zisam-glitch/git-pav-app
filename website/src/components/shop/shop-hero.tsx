import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CONTAINER } from "@/components/pricing/tokens";
import { HERO_CATEGORY_SLUGS, SHOP_CATEGORIES } from "./shop-catalog-data";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

const HERO_TILES = HERO_CATEGORY_SLUGS.map((slug) =>
  SHOP_CATEGORIES.find((cat) => cat.slug === slug),
).filter((cat): cat is (typeof SHOP_CATEGORIES)[number] => Boolean(cat));

/**
 * Shop hero after Hims' category pages ("Hair regrowth personalized to you", Mobbin): a very
 * large two-tone headline, a short line, and a row of cream category tiles with a product
 * on the right and a chevron.
 */
export function ShopHero({ onCategorySelect: _onCategorySelect }: ShopHeroProps) {
  return (
    <section
      id="top"
      aria-label="Shop dental products"
      className="bg-white pt-8 pb-10 md:pt-12 md:pb-14"
    >
      <div className={CONTAINER}>
        {/* The page keeps its heading for search engines and screen readers, but it is not shown. */}
        <h1 className="sr-only">Happy Tooth oral care at Pav Dental</h1>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_TILES.map((tile) => (
            <Link
              key={tile.slug}
              to="/category/$slug"
              params={{ slug: tile.slug }}
              className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#fbfbee] p-5"
            >
              {/* The packshot fades into the tile, so photo and tile read as one surface. */}
              <img
                src={tile.image}
                alt={tile.name}
                loading="eager"
                className="absolute inset-y-0 right-0 h-full w-[46%] brightness-[1.06] contrast-[0.97] object-cover object-[55%_50%] [mask-image:linear-gradient(to_right,transparent,#000_30%)] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="max-w-[56%] text-[19px] leading-[1.2] text-[#37556e]">
                  {tile.shortTitle} <span className="text-[#8a4242]">{tile.accentWord}</span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-[#1b1b1b]" />
              </div>
              <span className="relative line-clamp-2 max-w-[50%] text-[12px] leading-snug text-[#6d6e72]">
                {tile.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
