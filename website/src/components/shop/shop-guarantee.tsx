import { ArrowRight, MapPin, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import {
  ButtonLink,
  CallButton,
  FaqList,
  Heading,
  Section,
  Tile,
  type FaqItem,
} from "@/components/hims";
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
      {/* Rich Brown + Gold Clinical Guarantee & UK Delivery / Returns Band */}
      <Section
        id="clinical-guarantee"
        theme="brown"
        aria-label="Clinical guarantee and UK delivery standards"
      >
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/7 px-3.5 py-1 text-caption font-medium text-gold">
              <ShieldCheck aria-hidden className="size-3.5" />
              <span>Clinical Standards &amp; UK Distance Selling</span>
            </span>
            <Heading as="h2" size="h2-md" accent="delivered directly" tone="gold" className="mt-5">
              Clinic-grade care,{" "}
            </Heading>
            <p className="mt-4 text-lead text-white/80">
              Every product in our store is selected by the dental team at Pav Dental Bradford—no
              third-party marketplace resellers, clear UK pricing, and straightforward clinical
              support whenever you need advice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#catalog" variant="gold">
                Shop All Products
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <CallButton variant="glass" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:col-span-7">
            {DELIVERY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Tile key={pillar.title} tone="glass" className="border border-white/15 p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-pill bg-gold text-brown">
                      <Icon aria-hidden className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-h4 text-white">{pillar.title}</h3>
                      <p className="mt-2 text-small leading-relaxed text-white/80">{pillar.body}</p>
                    </div>
                  </div>
                </Tile>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Clean Cream FAQ Accordion Band */}
      <Section id="guarantee" theme="cream" aria-label="Shop frequently asked questions">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
          <div className="lg:sticky lg:top-20">
            <Heading as="h2" size="h2-md" accent="Questions" tone="terracotta">
              Frequently Asked{" "}
            </Heading>
            <p className="mt-4 text-lead text-muted">
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
      </Section>
    </>
  );
}
