import { ArrowUpRight } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";
import { PRODUCTS_DATA } from "./whitening-data";

export function WhiteningProducts() {
  return (
    <Section id="products" theme="white" aria-labelledby="whitening-products-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Dentist-Formulated Ranges
          </span>
          <div id="whitening-products-heading" className="mt-4">
            <Heading size="h2-md" accent="Whitening" tone="terracotta" inline>
              Award Winning
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Experience our award-winning whitening treatments for a brilliantly radiant smile.
            Discover the difference of our acclaimed whitening services today.
          </p>
        </div>

        <ButtonLink href="#comparison-matrix" variant="outline" size="sm" className="w-fit">
          Compare all ranges
        </ButtonLink>
      </div>

      <div className="mt-10 space-y-6">
        {PRODUCTS_DATA.map((product, i) => (
          <Tile
            key={product.id}
            as="article"
            tone="white"
            lift
            className="border border-border p-6 md:p-10"
          >
            <SplitFeature
              reverse={i % 2 === 1}
              media={<Media src={product.image} alt={product.alt} ratio="4 / 3" tone="cream" />}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-pill bg-cream px-3 py-1 text-caption font-medium text-terracotta tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-pill border border-border bg-cream px-3 py-1 text-caption font-medium text-copper"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-h4 font-medium text-terracotta tabular-nums">
                    {product.price}
                  </span>
                </div>

                <h3 className="mt-5 text-h3-md text-fg">
                  {product.name} - <span className="tabular-nums">{product.price}</span>
                </h3>

                <p className="mt-4 text-body leading-relaxed text-muted">{product.description}</p>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                  <BookButton>Appointment</BookButton>
                  <ButtonLink href="#comparison-matrix" variant="ghost" className="gap-1">
                    <span>Compare options</span>
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </div>
            </SplitFeature>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
