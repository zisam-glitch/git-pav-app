import { GeneralDentistryFeePanel, type FeeTier } from "./general-dentistry-fee-panel";

const TIERS: readonly FeeTier[] = [
  {
    id: "simple-extraction",
    label: "Simple Extraction",
    price: "£95",
    description:
      "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
  },
  {
    id: "intermediate-extraction",
    label: "Intermediate Extraction",
    price: "£145",
    description:
      "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
  },
  {
    id: "complex-extraction",
    label: "Complex Extraction",
    price: "£195",
    description:
      "Complex extractions involve surgical procedures, such as removing impacted teeth or those with complicated root structures. They typically require incisions, bone removal, and sometimes sectioning the tooth into multiple parts for easier removal.",
  },
];

export function GeneralDentistryExtractionPricingTable() {
  return (
    <GeneralDentistryFeePanel
      theme="white"
      title="Our Tooth Extraction"
      accent="Prices"
      tiers={TIERS}
    />
  );
}
