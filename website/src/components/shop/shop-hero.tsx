import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/hims";
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
    <section id="top" aria-label="Shop dental products" className="bg-white pt-10 pb-12 md:pt-16 md:pb-20">
      <div className={CONTAINER}>
        <p className="text-small text-[#6d6e72]">Pav Dental Store · Happy Tooth products</p>
        <h1 className="mt-3 text-[clamp(46px,7vw,104px)] leading-[0.98] font-normal tracking-[-0.035em] text-[#1b1b1b]">
          <span className="text-[#8a4242]">Happy Tooth</span>
          <br />
          oral care
        </h1>
        <p className="mt-6 max-w-[40rem] text-[clamp(17px,1.4vw,20px)] leading-[1.4] text-[#55565a]">
          Happy Tooth oral care, from our sister company: fluoride-free hydroxyapatite toothpaste,
          mineral mouthwash, natural whitening strips, the Happ E-Brush and bundles for the whole
          family.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="#catalog">Browse Products</ButtonLink>
          <ButtonLink href="#clinical-guarantee" variant="outline">
            Delivery &amp; Returns
          </ButtonLink>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-[#6d6e72]">
          <li>Made by Happy Tooth, our sister company</li>
          <li>Free UK tracked delivery over £40</li>
          <li>14-day UK returns on unopened items</li>
        </ul>

        <div className="mt-12 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_TILES.map((tile) => (
            <Link
              key={tile.slug}
              to="/category/$slug"
              params={{ slug: tile.slug }}
              className="group flex min-h-[170px] flex-col justify-between rounded-[24px] bg-gradient-to-b from-[#f7f3ea] to-[#f1eadc] p-5 t-colors hover:from-[#f3ede0] hover:to-[#ece3d2]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[19px] leading-[1.2] text-[#37556e]">
                  {tile.shortTitle} <span className="text-[#8a4242]">{tile.accentWord}</span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-[#1b1b1b]" />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="line-clamp-2 max-w-[56%] text-[12px] leading-snug text-[#6d6e72]">
                  {tile.description}
                </span>
                <span className="block size-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                  <img
                    src={tile.image}
                    alt={tile.name}
                    loading="eager"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
