import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";
import { PRODUCTS_DATA } from "./whitening-data";

export function WhiteningProducts() {
  return (
    <Section id="products" theme="cream">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Whitening" tone="terracotta" inline>
          Award Winning
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Experience our award-winning whitening treatments for a brilliantly radiant smile.
          Discover the difference of our acclaimed whitening services today.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {PRODUCTS_DATA.map((product, i) => (
          <article
            key={product.id}
            className="rounded-xl border border-border bg-white p-6 md:p-10"
          >
            <SplitFeature
              reverse={i % 2 === 1}
              media={<Media src={product.image} alt={product.alt} ratio="4 / 3" tone="cream" />}
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill border border-border bg-cream px-3 py-1 text-caption font-medium text-fg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-4 text-h3-md text-fg">
                  {product.name} - <span className="tabular-nums">{product.price}</span>
                </h3>

                <p className="mt-4 text-body text-muted">{product.description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <BookButton>Appointment</BookButton>
                  <ButtonLink href="#comparison-matrix" variant="outline">
                    Compare options
                  </ButtonLink>
                </div>
              </div>
            </SplitFeature>
          </article>
        ))}
      </div>
    </Section>
  );
}
