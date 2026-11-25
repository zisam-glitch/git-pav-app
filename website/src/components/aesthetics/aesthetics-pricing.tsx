import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";

const PRICE_CATEGORIES = [
  {
    title: "Dermal Fillers",
    eyebrow: "Volume & Contour",
    fromPrice: "£100",
    tone: "grey" as const,
    rows: [
      { item: "0.5ML", price: "£100" },
      { item: "0.7ML", price: "£150" },
      { item: "1ML", price: "£250" },
      { item: "2ML", price: "£350" },
      { item: "3ML", price: "£400" },
      { item: "4ML", price: "£450" },
    ],
  },
  {
    title: "Botox",
    eyebrow: "Anti-Wrinkle",
    fromPrice: "£180",
    tone: "grey" as const,
    rows: [
      { item: "1 AREA", price: "£180" },
      { item: "2 AREAS", price: "£240" },
      { item: "3 AREAS", price: "£300" },
      { item: "4 AREAS", price: "£400" },
    ],
  },
  {
    title: "Others",
    eyebrow: "Skin Boosters",
    fromPrice: "£160",
    tone: "grey" as const,
    rows: [
      { item: "PROFHILO FIRST DOSE", price: "£249" },
      { item: "SOSUM BOOSTER", price: "£160" },
    ],
  },
] as const;

export function AestheticsPricing() {
  return (
    <Section id="pricing" theme="white" aria-labelledby="aesthetics-pricing-heading">
      <div className="max-w-2xl">
        <div id="aesthetics-pricing-heading" className="mt-4">
          <Heading size="h2-md" accent="Price List" tone="terracotta" inline>
            Aesthetics
          </Heading>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PRICE_CATEGORIES.map((category) => (
          <Tile
            key={category.title}
            as="article"
            tone={category.tone}
            lift
            className="flex flex-col justify-between gap-6 border border-border p-6 md:p-8"
          >
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-copper">
                    {category.eyebrow}
                  </span>
                  <h3 className="mt-3 text-h3-md text-fg">{category.title}</h3>
                </div>
                <div className="text-right">
                  <span className="block text-caption font-medium text-muted">Price</span>
                  <span className="mt-1 block text-h4 font-medium text-terracotta tabular-nums">
                    From {category.fromPrice}
                  </span>
                </div>
              </div>

              <ul className="mt-2 divide-y divide-border">
                {category.rows.map((row) => (
                  <li key={row.item} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-body font-medium text-fg">{row.item}</span>
                    <span className="text-h4 font-medium text-copper tabular-nums">
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-5">
              <BookButton className="w-full">Book Now</BookButton>
            </div>
          </Tile>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-white p-6 md:flex-row md:items-center md:p-8">
        <p className="max-w-2xl text-lead text-fg">
          Offers and packages now availabe. Please enquire with our team today on{" "}
          <a
            href="tel:08000996375"
            className="font-medium text-terracotta underline underline-offset-4 t-colors hover:text-fg"
          >
            0800 099 6375
          </a>{" "}
          to find out more
        </p>
        <div className="flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" href="tel:08000996375">
            Call 0800 099 6375
          </CallButton>
        </div>
      </div>
    </Section>
  );
}
