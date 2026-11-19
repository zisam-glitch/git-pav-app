import { BookButton, PricingTiles, Tile, type PricingTier } from "@/components/hims";

const TIERS: readonly PricingTier[] = [
  {
    id: "simple",
    eyebrow: "Simple Extraction (£95)",
    price: "£95",
    name: "Simple Extraction",
    description:
      "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
    tone: "cream",
  },
  {
    id: "intermediate",
    eyebrow: "Intermediate Extraction (£145)",
    price: "£145",
    name: "Intermediate Extraction",
    description:
      "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
    tone: "cream",
  },
  {
    id: "advanced",
    eyebrow: "Advanced Extraction (£195)",
    price: "£195",
    name: "Advanced Extraction",
    description:
      "This involves difficult extractions due to root shape, tooth position, or limited access in the mouth. The procedure may require sectioning the tooth or removing a small amount of surrounding bone to allow safe removal.",
    tone: "cream",
  },
  {
    id: "surgical",
    eyebrow: "Surgical Extraction (£295)",
    price: "£295",
    name: "Surgical Extraction",
    description:
      "This involves a surgical procedure for impacted or severely damaged teeth, often requiring gum incision, bone removal, and tooth sectioning to safely extract the tooth.",
    tone: "sage",
  },
];

export function ExtractionPricing() {
  return (
    <PricingTiles
      title="Our Tooth"
      accent="Extraction Prices"
      tiers={TIERS}
      columns={4}
      ctaLabel="Make an Appointment"
      footer={
        <Tile tone="cream" className="flex flex-wrap items-center justify-between gap-4 p-6 md:p-8">
          <div>
            <h3 className="text-h4 text-fg">Informed Consent for Tooth Extraction</h3>
            <p className="mt-1 text-body text-muted">
              Your clinician will talk through your procedure, alternatives, and aftercare before
              any treatment begins.
            </p>
          </div>
          <BookButton variant="outline">Book Consultation</BookButton>
        </Tile>
      }
    />
  );
}
