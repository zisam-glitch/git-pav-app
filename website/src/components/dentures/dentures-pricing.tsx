import { PricingTiles, type PricingTier } from "@/components/hims";

const DENTURE_TIERS: readonly PricingTier[] = [
  {
    id: "acrylic",
    eyebrow: "",
    price: "£495",
    name: "Acrylic Denture",
    description: "• Acrylic Denture – £495",
    tone: "cream",
  },
  {
    id: "flexible",
    eyebrow: "",
    price: "£795",
    name: "Flexible (Valplast) Denture",
    description: "• Flexible (Valplast) Denture – £795",
    tone: "sage",
  },
  {
    id: "cobalt-chromium",
    eyebrow: "",
    price: "£1195",
    name: "Cobalt Chromium Denture",
    description: "• Cobalt Chromium Denture – £1195",
    tone: "cream",
  },
];

export function DenturesPricing() {
  return (
    <PricingTiles
      id="pricing"
      theme="white"
      title="Our Denture"
      accent="Prices:"
      lead="Qualifications: Make sure the dentist is board-certified and has good reviews."
      tiers={DENTURE_TIERS}
      columns={3}
      ctaLabel="Make an Appointment"
    />
  );
}
