import {
  BookButton,
  CompareTable,
  FeatureBento,
  Section,
  type PricingTier,
} from "@/components/hims";

export const TIERS: readonly PricingTier[] = [
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

const [BASIC, MID, ADV] = TIERS;
const IMG = "/images/generated/root-canal-hero.jpg";

export function RootCanalPricing() {
  return (
    <>
      <Section id="pricing" theme="white" aria-labelledby="root-canal-prices-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="root-canal-prices-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Our Root Canal <span className="text-[#8a4242]">Prices</span>
          </h2>
        </div>
        <div className="mt-12">
          <FeatureBento
            feature={{
              title: ADV.name,
              kicker: ADV.bestFor?.replace("Best for: ", ""),
              price: ADV.price,
              image: IMG,
              alt: "Warm sunlit Pav Dental treatment room prepared for root canal care",
              href: "#compare",
            }}
            items={[
              {
                title: BASIC.name,
                kicker: BASIC.bestFor?.replace("Best for: ", ""),
                price: BASIC.price,
                image: "/images/generated/root-canal-how.jpg",
                alt: "",
                href: "#compare",
              },
              {
                title: MID.name,
                kicker: MID.bestFor?.replace("Best for: ", ""),
                price: MID.price,
                image: "/images/generated/root-canal-tooth.jpg",
                alt: "",
                href: "#compare",
              },
            ]}
            help={{
              title: "Talk to our team",
              text: "Not sure which tier your tooth needs? Book an appointment and we will assess it.",
              cta: <BookButton variant="gold">Make an Appointment</BookButton>,
            }}
          />
        </div>
      </Section>

      <Section id="compare" theme="white" aria-labelledby="root-canal-compare-heading">
        <div className="mx-auto max-w-[900px]">
          <h2
            id="root-canal-compare-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            A range of <span className="text-[#4a5c66]">options</span>
          </h2>
          <div className="mt-10">
            <CompareTable
              columns={TIERS.map((t) => ({ name: t.name, sub: t.price }))}
              rows={[
                {
                  label: "Best for",
                  cells: TIERS.map((t) => (t.bestFor ?? "").replace("Best for: ", "")),
                },
                { label: "Details", cells: TIERS.map((t) => t.description) },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
