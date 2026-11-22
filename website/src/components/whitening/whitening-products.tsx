import { ArrowUpRight } from "lucide-react";
import { BookButton, ButtonLink, Section } from "@/components/hims";
import { OptionTiles, type OptionTile } from "@/components/hims/option-tiles";
import { PRODUCTS_DATA } from "./whitening-data";

const TILES: readonly OptionTile[] = PRODUCTS_DATA.map((product) => ({
  id: product.id,
  title: product.name,
  price: product.price,
  badges: product.tags.map((text) => ({ text })),
  media: product.image ? { src: product.image, alt: product.alt } : undefined,
  href: `#${product.id}`,
}));

export function WhiteningProducts() {
  return (
    <>
      <OptionTiles
        id="products"
        theme="white"
        title="Award Winning"
        accent="Whitening"
        lead="Experience our award-winning whitening treatments for a brilliantly radiant smile. Discover the difference of our acclaimed whitening services today."
        action={
          <ButtonLink href="#comparison-matrix" variant="outline">
            Compare all ranges
          </ButtonLink>
        }
        items={TILES}
      />

      <Section theme="white" space="none" className="pb-10 md:pb-20">
        <div className="divide-y divide-border border-y border-border">
          {PRODUCTS_DATA.map((product, index) => (
            <article
              key={product.id}
              id={product.id}
              className="grid scroll-mt-24 gap-6 py-10 md:py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-14"
            >
              <div>
                <p className="text-label tabular-nums text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-h3-md">
                  {product.name} - <span className="tabular-nums">{product.price}</span>
                </h3>
              </div>
              <div>
                <p className="max-w-2xl text-body text-muted">{product.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <BookButton>Appointment</BookButton>
                  <ButtonLink href="#comparison-matrix" variant="ghost" className="gap-1">
                    <span>Compare options</span>
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
