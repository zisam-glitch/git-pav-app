import { PricingTiles, type PricingTier } from "@/components/hims";

const SERVICES: readonly PricingTier[] = [
  {
    id: "basic",
    eyebrow: "Basic – Polish Only (£45)",
    price: "£45",
    name: "Basic – Polish Only",
    description:
      "A gentle professional polish to remove surface stains and plaque build-up. Ideal for patients who maintain good oral hygiene and simply want fresher breath and a brighter smile. This treatment focuses on improving appearance and smoothness of the teeth but does not include deep stain or tartar removal.",
    bestFor: "Best for: light staining from tea, coffee, or smoking.",
    tone: "cream",
  },
  {
    id: "intermediate",
    eyebrow: "Intermediate – Scale Only (£65)",
    price: "£65",
    name: "Intermediate – Scale Only",
    description:
      "A professional scale to remove hardened plaque and tartar from around the teeth and gumline. This treatment focuses on improving gum health by removing deposits that cannot be cleaned at home. It helps reduce inflammation, bleeding gums, and bad breath.",
    bestFor: "Best for: patients with noticeable tartar build-up or early gum concerns.",
    tone: "cream",
  },
  {
    id: "advanced",
    eyebrow: "Advanced – Scale & Polish (£75)",
    price: "£75",
    name: "Advanced – Scale & Polish",
    description:
      "A comprehensive clean combining full scaling and polishing for optimal oral health and aesthetics. Tartar and plaque are thoroughly removed from above and just below the gumline, followed by polishing to smooth the teeth and enhance shine. Topical anaesthesia can be used for added comfort if you have sensitive gums.",
    bestFor:
      "Best for: moderate build-up, gum inflammation, or patients wanting the most complete clean and refresh.",
    tone: "sage",
  },
];

export function OralHygienePricing() {
  return (
    <PricingTiles
      title="Our Hygiene"
      accent="Services"
      tiers={SERVICES}
      columns={3}
      ctaLabel="Make an Appointment"
    />
  );
}
