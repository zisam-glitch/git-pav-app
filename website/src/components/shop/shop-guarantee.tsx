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
    title: "Click & Collect in Bradford",
    body: `Free Clinic Click & Collect is available at ${SHOP_DISPATCH_ADDRESS}, 7 days a week.`,
  },
] as const;

const FAQS: FaqItem[] = [
  {
    q: "What makes Happy Tooth toothpaste different?",
    a: "It is made with 10% micro-hydroxyapatite to strengthen enamel, cleans without harsh SLS, has no artificial sweeteners or artificial colors, and is 100% fluoride-free. It comes in six flavours: Fresh Mint, Vanilla Frosting, Sweet Orange, Mint Brownie, Lemon Twist and Strawberry Bubblegum.",
  },
  {
    q: "Are the natural whitening strips enamel safe?",
    a: "Happy Tooth describes its Natural Whitening Strips as sparkly white, enamel safe and sensitivity free, made with clean ingredients. Each pack holds 14 treatments. If you have sensitive teeth or gums, call us on 0800 1938 786 or book a consultation before you start.",
  },
  {
    q: "How much is UK delivery?",
    a: `UK tracked delivery is free on orders over £40 and £3.99 on orders under £40. You can also collect free from Pav Dental at ${SHOP_DISPATCH_ADDRESS}.`,
  },
  {
    q: "What is your UK returns and refunds policy?",
    a: "Under UK distance-selling rules, you may return unopened, sealed hygiene products and oral care devices within 14 days of receipt for a full refund. For hygiene and patient safety reasons, opened consumables (such as strips, toothpaste, or unsealed brush heads) cannot be returned unless faulty or damaged on arrival.",
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
        <div className={`${CONTAINER} grid items-stretch gap-3 lg:grid-cols-[1fr_1.1fr] lg:gap-4`}>
          <div className={`${SOFT_CARD} flex flex-col justify-between gap-8 p-7 md:p-10`}>
            <div>
              <p className="text-small text-[#55565a]">
                Clinical Standards &amp; UK Distance Selling
              </p>
              <h2 className="mt-3 text-[clamp(32px,3.4vw,50px)] leading-[1.04] font-normal tracking-[-0.025em] text-[#1b1b1b]">
                Better oral care, <span className={MUTED_TITLE}>delivered directly</span>
              </h2>
              <p className={`mt-5 ${LEAD}`}>
                Every product in our store is made by Happy Tooth, our sister company—no third-party
                marketplace resellers, clear UK pricing, and straightforward support from the Pav
                Dental team whenever you need advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="#catalog">
                Shop All Products
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <CallButton variant="outline" />
            </div>
          </div>

          <ul className={`${SOFT_CARD} flex flex-col justify-between p-7 md:p-10`}>
            {DELIVERY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <li
                  key={pillar.title}
                  className="flex gap-5 border-b border-[#1b1b1b]/10 py-7 first:pt-0 last:border-0 last:pb-0"
                >
                  <Icon
                    aria-hidden
                    strokeWidth={1.3}
                    className="mt-1 size-9 shrink-0 text-[#1b1b1b]"
                  />
                  <div>
                    <h3 className="text-[clamp(20px,1.7vw,24px)] leading-[1.15] text-[#1b1b1b]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-[#55565a]">{pillar.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Questions: the Hims accordion */}
      <section
        id="guarantee"
        aria-label="Shop frequently asked questions"
        className="scroll-mt-20 bg-white py-14 md:py-24"
      >
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
