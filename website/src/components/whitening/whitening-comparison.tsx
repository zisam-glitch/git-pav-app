import { BookButton, Heading, Section, Tile } from "@/components/hims";

const COMPARISON_COLUMNS = [
  {
    id: "whitening-strips",
    name: "Whitening Strips",
    eyebrow: "On-the-Go Maintenance",
    price: "£65",
    options: "Professional Whitening Strips · Dissolving Whitening Strips",
    contents: "14 applications (28 strips)",
    formula: "Mint-flavored dissolving whitening strips with an advanced enamel-safe formula",
    application: "Short application time, no strips to remove, non-slip technology",
    bestFor: "On-the-go touch-ups and ongoing smile maintenance",
    buttonVariant: "outline" as const,
  },
  {
    id: "home-teeth-whitening",
    name: "Home Teeth Whitening",
    eyebrow: "Dentist-Crafted Trays",
    price: "£295",
    options: "Day Whitening Kits · Night Whitening Kits",
    contents: "4 x 3ml syringes and a 30ml pre-polishing paste",
    formula:
      "UK-made teeth whitening gel infused with potassium nitrate, calcium, and fluoride (hydrogen peroxide or carbamide peroxide options)",
    application: "Day or night kit options crafted by dentists",
    bestFor: "Optimum results with minimized sensitivity",
    buttonVariant: "default" as const,
  },
  {
    id: "home-in-office-whitening",
    name: "Home & In Office Whitening",
    eyebrow: "Dual-Action Hybrid",
    price: "£495",
    options: "BEAM In-Office Whitening Gel · BEAM Professional Whitening Kit",
    contents: "In-office whitening session with pre-whitening varnish, plus at-home kit",
    formula: "Unique hybrid dual-action 6% Hydrogen Peroxide + PAP formula",
    application: "In-office priming varnish and whitening session, continued at home",
    bestFor: "In-office whitening with continued at-home treatment",
    buttonVariant: "outline" as const,
  },
] as const;

const ROWS: Array<{
  label: string;
  key: "options" | "contents" | "formula" | "application" | "bestFor";
}> = [
  { label: "Options", key: "options" },
  { label: "Pack / Session", key: "contents" },
  { label: "Formula", key: "formula" },
  { label: "Use", key: "application" },
  { label: "Best suited for", key: "bestFor" },
];

export function WhiteningComparison() {
  return (
    <Section id="comparison-matrix" theme="sand" aria-labelledby="whitening-comparison-heading">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
          Transparent Pricing (£65 – £495)
        </span>
        <div id="whitening-comparison-heading" className="mt-4">
          <Heading size="h2-md" accent="Whitening Ranges" tone="terracotta" inline>
            Compare Our
          </Heading>
        </div>
        <p className="mt-4 text-lead text-muted">
          Side-by-side overview of our three whitening options, formulas, and what is included.
        </p>
      </div>

      {/* Desktop comparison table */}
      <div className="mt-10 hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-cream">
              <th className="w-1/4 px-6 py-6 text-small font-medium text-muted">Feature</th>
              {COMPARISON_COLUMNS.map((col) => (
                <th key={col.id} className="w-1/4 px-6 py-6 align-top">
                  <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-copper">
                    {col.eyebrow}
                  </span>
                  <div className="mt-3 text-h4 text-fg">{col.name}</div>
                  <div className="mt-1 text-h3-md text-terracotta tabular-nums">{col.price}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-body">
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="px-6 py-4 align-top text-label text-fg">{row.label}</td>
                {COMPARISON_COLUMNS.map((col) => (
                  <td key={col.id} className="px-6 py-4 align-top text-small leading-relaxed text-muted">
                    {col[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-cream/50">
              <td className="px-6 py-5 text-label text-fg">Appointment</td>
              {COMPARISON_COLUMNS.map((col) => (
                <td key={col.id} className="px-6 py-5">
                  <BookButton size="sm" variant={col.buttonVariant} className="w-full">
                    Book Now
                  </BookButton>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile stacked comparison cards */}
      <div className="mt-8 grid gap-4 md:hidden">
        {COMPARISON_COLUMNS.map((col) => (
          <Tile key={col.id} as="article" tone="white" className="border border-border p-6">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3 py-0.5 text-caption font-medium text-copper">
                  {col.eyebrow}
                </span>
                <h3 className="mt-2 text-h4 text-fg">{col.name}</h3>
              </div>
              <span className="text-h3-md text-terracotta tabular-nums">{col.price}</span>
            </div>
            <dl className="mt-4 divide-y divide-border">
              {ROWS.map((row) => (
                <div key={row.key} className="py-3">
                  <dt className="text-caption font-medium text-muted">{row.label}</dt>
                  <dd className="mt-1 text-small text-fg">{col[row.key]}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 pt-2">
              <BookButton variant={col.buttonVariant} className="w-full">
                Book Now
              </BookButton>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
