import { PricingTiles, type PricingTier } from "@/components/hims";

const TIERS: readonly PricingTier[] = [
  {
    id: "basic",
    eyebrow: "Basic Root Canal (£195)",
    price: "£195",
    name: "Basic Root Canal",
    description:
      "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines). These teeth usually have a straightforward root canal system, which makes the treatment less complicated and time-consuming.",
    bestFor: "Best for: Front teeth (incisors and canines) with a single root.",
    tone: "cream",
  },
  {
    id: "intermediate",
    eyebrow: "Intermediate Root Canal (£295)",
    price: "£295",
    name: "Intermediate Root Canal",
    description:
      "This pricing tier is generally for root canal treatments on premolars or teeth with two roots. The procedure in this category may be more complex than a standard root canal due to the presence of multiple roots and potentially more intricate root canal systems.",
    bestFor: "Best for: Premolars or teeth with two roots.",
    tone: "cream",
  },
  {
    id: "advanced",
    eyebrow: "Advanced Root Canal (£395)",
    price: "£395",
    name: "Advanced Root Canal",
    description:
      "This is for the most complex root canal treatments, typically involving molars, which have multiple roots and a more complex root canal system. These procedures are often more time-consuming and require advanced techniques and equipment, justifying the higher price.",
    bestFor: "Best for: Molars with multiple roots and complex canal anatomy.",
    tone: "sage",
  },
];

export function RootCanalPricing() {
  return (
    <PricingTiles
      id="pricing"
      theme="white"
      title="Our Root Canal"
      accent="Prices"
      tiers={TIERS}
      columns={3}
      ctaLabel="Make an Appointment"
    />
  );
}
