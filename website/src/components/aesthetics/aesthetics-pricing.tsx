import { BookButton, CallButton, Heading, Section } from "@/components/hims";

const PRICE_CATEGORIES = [
  {
    title: "Dermal Fillers",
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
    rows: [
      { item: "1 AREA", price: "£180" },
      { item: "2 AREAS", price: "£240" },
      { item: "3 AREAS", price: "£300" },
      { item: "4 AREAS", price: "£400" },
    ],
  },
  {
    title: "Others",
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
        <div id="aesthetics-pricing-heading">
          <Heading size="h2-md" accent="Price List" tone="terracotta" inline>
            Aesthetics
          </Heading>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PRICE_CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-white"
          >
            <div className="flex items-center justify-between border-b border-border bg-cream px-6 py-4">
              <h3 className="text-h4 text-fg">{category.title}</h3>
              <span className="text-small font-medium text-muted">Price</span>
            </div>
            <ul className="divide-y divide-border px-6">
              {category.rows.map((row) => (
                <li key={row.item} className="flex items-center justify-between gap-4 py-4">
                  <span className="text-body font-medium text-fg">{row.item}</span>
                  <span className="text-h4 text-fg tabular-nums">{row.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-xl bg-tile-cream p-6 md:flex-row md:items-center md:p-8">
        <p className="max-w-2xl text-lead text-fg">
          Offers and packages now availabe. Please enquire with our team today on{" "}
          <a
            href="tel:08000996375"
            className="underline underline-offset-4 t-colors hover:text-terracotta"
          >
            0800 099 6375
          </a>{" "}
          to find out more
        </p>
        <div className="flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
        </div>
      </div>
    </Section>
  );
}
