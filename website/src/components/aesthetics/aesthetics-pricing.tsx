import { BookButton, CallButton, Section } from "@/components/hims";
import { PriceList } from "@/components/hims/price-list";
import { SectionHeader } from "@/components/hims/section-header";

const PRICE_CATEGORIES = [
  {
    title: "Dermal Fillers",
    rows: [
      { label: "0.5ML", price: "£100" },
      { label: "0.7ML", price: "£150" },
      { label: "1ML", price: "£250" },
      { label: "2ML", price: "£350" },
      { label: "3ML", price: "£400" },
      { label: "4ML", price: "£450" },
    ],
  },
  {
    title: "Botox",
    rows: [
      { label: "1 AREA", price: "£180" },
      { label: "2 AREAS", price: "£240" },
      { label: "3 AREAS", price: "£300" },
      { label: "4 AREAS", price: "£400" },
    ],
  },
  {
    title: "Others",
    rows: [
      { label: "PROFHILO FIRST DOSE", price: "£249" },
      { label: "SOSUM BOOSTER", price: "£160" },
    ],
  },
] as const;

export function AestheticsPricing() {
  return (
    <Section id="pricing" theme="cream">
      <SectionHeader
        title="Aesthetics"
        accent="Price List"
        action={<BookButton>Book Now</BookButton>}
      />

      <div className="mt-10 grid gap-3 md:mt-14 md:gap-4 lg:grid-cols-3">
        {PRICE_CATEGORIES.map((category) => (
          <article key={category.title} className="rounded-[1.5rem] bg-white p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-h4 text-fg">{category.title}</h3>
              <span className="text-small text-muted">Price</span>
            </div>
            <PriceList rows={category.rows} className="mt-4" />
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-[1.5rem] bg-white p-6 md:flex-row md:items-center md:p-8">
        <p className="max-w-2xl text-lead text-fg">
          Offers and packages now availabe. Please enquire with our team today on{" "}
          <a
            href="tel:08000996375"
            className="font-medium underline underline-offset-4 t-colors hover:text-terracotta"
          >
            0800 099 6375
          </a>{" "}
          to find out more
        </p>
        <CallButton variant="outline" href="tel:08000996375">
          Call 0800 099 6375
        </CallButton>
      </div>
    </Section>
  );
}
