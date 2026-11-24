import { BookButton, CallButton, PricingTiles, Tile, type PricingTier } from "@/components/hims";

const DENTURE_TIERS: readonly PricingTier[] = [
  {
    id: "acrylic",
    eyebrow: "Standard Tier",
    price: "£495",
    name: "Acrylic Denture",
    description: "• Acrylic Denture - £495",
    bestFor: "Custom-crafted acrylic base with natural tooth shade matching.",
    tone: "grey",
  },
  {
    id: "flexible",
    eyebrow: "Popular Choice",
    price: "£795",
    name: "Flexible (Valplast) Denture",
    description: "• Flexible (Valplast) Denture - £795",
    bestFor: "Lightweight, metal-free flexible resin that adapts gently to your gums.",
    tone: "grey",
  },
  {
    id: "cobalt-chromium",
    eyebrow: "Precision Metal Framework",
    price: "£1195",
    name: "Cobalt Chromium Denture",
    description: "• Cobalt Chromium Denture - £1195",
    bestFor: "Ultra-thin, durable cast framework for superior stability and chewing comfort.",
    tone: "grey",
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
        <Tile
          tone="white"
          className="flex flex-col items-start justify-between gap-4 border border-border p-6 md:flex-row md:items-center md:p-8"
        >
          <p className="max-w-2xl text-lead text-fg">
            Book your free consultation today with one of our GDC-registered dentists to start your
            journey towards a confident, healthy smile.
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </Tile>
      }
    />
  );
}
