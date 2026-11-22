import { GeneralDentistryFeePanel, type FeeTier } from "./general-dentistry-fee-panel";

const TIERS: readonly FeeTier[] = [
  {
    id: "basic-composite",
    label: "Basic Composite",
    price: "£95",
    description:
      "This pricing is generally for small composite fillings, typically used for minor tooth decay or small cavities. These fillings are ideal for restoring teeth with minimal structural damage. The procedure usually involves a straightforward treatment, often completed in one visit, and covers essential restoration needs.",
  },
  {
    id: "intermediate-composite",
    label: "Intermediate Composite",
    price: "£145",
    description:
      "Fillings are for moderate tooth decay or larger cavities, requiring detailed work. They involve extensive tooth preparation and careful shaping of the composite material. This tier includes fillings for areas with high biting force, needing durable and precise restorations for effective and long-lasting results.",
  },
  {
    id: "advanced-composite",
    label: "Advanced Composite",
    price: "£195",
    description:
      "Advanced Composite Fillings are priced higher due to their complexity and materials. They treat significant decay or damage, covering multiple tooth surfaces or complex anatomy. These fillings require extensive shaping for proper bite and aesthetics, often needing time-consuming procedures or multiple visits.",
  },
];

export function GeneralDentistryFillingPricingTable() {
  return (
    <GeneralDentistryFeePanel
      theme="cream"
      title="Our White Filling"
      accent="Prices"
      tiers={TIERS}
    />
  );
}
