import { ArrowRight, MapPin, RotateCcw, Truck } from "lucide-react";
import { ButtonLink, CallButton, FaqList, type FaqItem } from "@/components/hims";
import { CONTAINER, LEAD, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { SHOP_DISPATCH_ADDRESS } from "./shop-catalog-data";

const DELIVERY_PILLARS = [
  {
    icon: Truck,
    title: "Free UK Tracked Delivery over £40",
    body: "Orders of £40 or more qualify for complimentary Royal Mail Tracked delivery. Standard UK tracked delivery is £3.99 on orders under £40, dispatched Monday–Friday.",
  },
  {
    icon: RotateCcw,
    title: "14-Day UK Distance-Selling Returns",
    body: "You have 14 days from delivery to return any unopened, factory-sealed oral hygiene item or electrical device for a full refund under UK Consumer Contracts Regulations.",
  },
  {
    icon: MapPin,
    title: "Dispatched from Bradford Clinic",
    body: `Packed and quality-checked by our clinical team at ${SHOP_DISPATCH_ADDRESS}, with free Clinic Click & Collect available 7 days a week.`,
  },
] as const;

const FAQS: FaqItem[] = [
  {
    q: "Will the 14-day whitening strips cause tooth or gum sensitivity?",
    a: "Our 14-day whitening strips use a peroxide-free PAP+ active brightening complex paired with hydroxyapatite and potassium citrate. For patients prone to cold sensitivity, we also stock Post-Whitening Sensitivity Relief Gel to calm teeth during and after brightening.",
  },
  {
    q: "Who can order Whitening Top-Up Syringes?",
    a: "Our single (£45) and 4-pack (£95) top-up syringes match our published clinic fees and are formulated for adults aged 18+ who already own dentist-fitted custom whitening trays. If you need custom trays made first, book a whitening consultation at our Bradford clinic.",
  },
  {
    q: "How much is UK delivery and where do orders ship from?",
    a: `All orders are dispatched from Pav Dental at ${SHOP_DISPATCH_ADDRESS}. UK tracked delivery is free on orders over £40 and £3.99 on orders under £40. Orders placed before 2 PM Monday–Friday are dispatched the same working day, or you can collect in clinic.`,
  },
  {
    q: "What is your UK returns and refunds policy?",
    a: "Under UK distance-selling rules, you may return unopened, sealed hygiene products and oral care devices within 14 days of receipt for a full refund. For hygiene and patient safety reasons, opened consumables (such as strips, syringes, toothpaste, or unsealed brush heads) cannot be returned unless faulty or damaged on arrival.",
  },
];

export function ShopGuarantee() {
  return (
    <>
      {/* Delivery and returns: the Hims "by the numbers" card pair */}
      <section
        id="clinical-guarantee"
        aria-label="Clinical guarantee and UK delivery standards"
        className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24"
      >
        <div className={`${CONTAINER} grid items-start gap-3 lg:grid-cols-[1fr_1.1fr] lg:gap-4`}>
          <div className={`${SOFT_CARD} p-7 md:p-10`}>
            <p className="text-small text-[#55565a]">Clinical Standards &amp; UK Distance Selling</p>
            <h2 className={`mt-3 ${TITLE}`}>
              Clinic-grade care, <span className={MUTED_TITLE}>delivered directly</span>
            </h2>
            <p className={`mt-5 ${LEAD}`}>
              Every product in our store is selected by the dental team at Pav Dental Bradford—no
              third-party marketplace resellers, clear UK pricing, and straightforward clinical
              support whenever you need advice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#catalog">
                Shop All Products
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <CallButton variant="outline" />
            </div>
          </div>

          <ul className={`${SOFT_CARD} p-7 md:p-10`}>
            {DELIVERY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <li
                  key={pillar.title}
                  className="flex gap-5 border-b border-[#1b1b1b]/10 py-7 first:pt-0 last:border-0 last:pb-0"
                >
                  <Icon aria-hidden strokeWidth={1.3} className="mt-1 size-9 shrink-0 text-[#1b1b1b]" />
                  <div>
                    <h3 className="text-[clamp(20px,1.7vw,24px)] leading-[1.15] text-[#1b1b1b]">{pillar.title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-[#55565a]">{pillar.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Questions: the Hims accordion */}
      <section id="guarantee" aria-label="Shop frequently asked questions" className="scroll-mt-20 bg-white py-14 md:py-24">
        <div className={`${CONTAINER} grid items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}>
          <div className="lg:sticky lg:top-24">
            <h2 className={TITLE}>
              Frequently Asked <span className={MUTED_TITLE}>Questions</span>
            </h2>
            <p className={`mt-4 ${LEAD}`}>
              Clear answers on product suitability, UK tracked delivery, Bradford click &amp;
              collect, and our 14-day returns policy.
            </p>
            <div className="mt-6">
              <ButtonLink href="#catalog">
                Browse Products
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </div>

          <FaqList items={FAQS} />
        </div>
      </section>
    </>
  );
}
