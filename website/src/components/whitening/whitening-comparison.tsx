import { BookButton } from "@/components/hims";
import { ComparisonTable } from "@/components/hims/comparison-table";

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

const ROW_LABELS = [
  { label: "Options", key: "options" },
  { label: "Pack / Session", key: "contents" },
  { label: "Formula", key: "formula" },
  { label: "Use", key: "application" },
  { label: "Best suited for", key: "bestFor" },
] as const;

export function WhiteningComparison() {
  return (
    <ComparisonTable
      id="comparison-matrix"
      theme="sand"
      title="Compare Our"
      accent="Whitening Ranges"
      lead="Side-by-side overview of our three whitening options, formulas, and what is included."
      columns={COMPARISON_COLUMNS.map((column) => ({
        id: column.id,
        name: column.name,
        eyebrow: column.eyebrow,
        price: column.price,
        action: (
          <BookButton variant={column.buttonVariant} className="w-full">
            Book Now
          </BookButton>
        ),
      }))}
      rows={ROW_LABELS.map((row) => ({
        label: row.label,
        values: COMPARISON_COLUMNS.map((column) => column[row.key]),
      }))}
    />
  );
}
