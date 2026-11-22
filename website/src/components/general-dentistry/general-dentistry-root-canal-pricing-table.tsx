import { GeneralDentistryTierCards, type TierCard } from "./general-dentistry-tier-cards";

const TIERS: readonly TierCard[] = [
  {
    id: "basic-root-canal",
    label: "Basic Root Canal",
    price: "£195",
    description:
      "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines). These teeth usually have a straightforward root canal system, which makes the treatment less complicated and time-consuming.",
  },
  {
    id: "intermediate-root-canal",
    label: "Intermediate Root Canal",
    price: "£295",
    description:
      "This pricing tier is generally for root canal treatments on premolars or teeth with two roots. The procedure in this category may be more complex than a standard root canal due to the presence of multiple roots and potentially more intricate root canal systems.",
  },
  {
    id: "advanced-root-canal",
    label: "Advanced Root Canal",
    price: "£395",
    description:
      "This is for the most complex root canal treatments, typically involving molars, which have multiple roots and a more complex root canal system. These procedures are often more time-consuming and require advanced techniques and equipment, justifying the higher price.",
  },
];

export function GeneralDentistryRootCanalPricingTable() {
  return (
    <GeneralDentistryTierCards
      id="pricing"
      theme="cream"
      title="Our Root Canal"
      accent="Prices"
      tiers={TIERS}
    />
  );
}
