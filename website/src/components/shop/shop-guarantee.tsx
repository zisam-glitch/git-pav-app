import { ArrowRight } from "lucide-react";
import { ButtonLink, FaqList, Heading, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "Will the teeth whitening system cause tooth or gum sensitivity?",
    a: "No. Our whitening systems utilize Phthalimidoperoxycaproic acid (PAP+) rather than high-concentration hydrogen peroxide. PAP+ oxidizes organic stains without stripping vital tooth enamel or inflaming nerve endings.",
  },
  {
    q: "How does the custom impression kit work for grillz and nightguards?",
    a: "We send you medical-grade silicone dental putty and universal trays with easy instructions. You take your impression at home in 3 minutes and post it back to our Bradford clinic using the included prepaid tracked box. Our registered lab then handcrafts your bespoke piece.",
  },
  {
    q: "How fast is shipping and can I collect in-clinic?",
    a: "All orders placed before 2 PM Monday–Friday are dispatched same day via Royal Mail 24/48 Tracked. Orders over £40 receive free UK tracked delivery. You can also select 'Clinic Click & Collect' at 786 Leeds Road, Bradford.",
  },
  {
    q: "What is your return and refund policy?",
    a: "We offer a 30-day money-back guarantee on all unopened oral care devices and non-custom products. For custom impression kits, if your dental impression requires retaking, we provide replacement impression putty free of charge.",
  },
];

export function ShopGuarantee() {
  return (
    <Section id="guarantee" theme="sand" aria-label="Shop frequently asked questions">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
        <div className="lg:sticky lg:top-20">
          <Heading as="h2" size="h2-md" accent="Questions" tone="terracotta">
            Frequently Asked
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Everything you need to know about our dental products, shipping, and returns.
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
  );
}
