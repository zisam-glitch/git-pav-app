import { PricingTiles, type PricingTier } from "@/components/hims";

const DENTURE_TIERS: readonly PricingTier[] = [
  {
    id: "acrylic",
    eyebrow: "Dentures",
    price: "£495",
    name: "Acrylic Denture",
    description: "Acrylic Denture – £495",
    tone: "cream",
  },
  {
    id: "flexible",
    eyebrow: "Dentures",
    price: "£795",
    name: "Flexible (Valplast) Denture",
    description: "Flexible (Valplast) Denture – £795",
    tone: "sage",
  },
  {
    id: "cobalt-chromium",
    eyebrow: "Dentures",
    price: "£1195",
    name: "Cobalt Chromium Denture",
    description: "Cobalt Chromium Denture – £1195",
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
      footer={
        <p className="max-w-3xl text-lead text-muted">
          Book your free consultation today with one of our GDC-registered dentists to start your
          journey towards a confident, healthy smile.
        </p>
      }
    />
  );
}
