import { useState } from "react";
import { ChevronDown, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECKLIST_ITEMS = [
  "Dentist-selected oral care essentials",
  "Free UK tracked delivery on orders over £40",
  "Same-day dispatch Mon–Fri before 2 PM",
  "Clinic Click & Collect at 786 Leeds Road, Bradford",
  "30-day money-back guarantee on unopened items",
];

const FAQS = [
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="guarantee" className="bg-[#FBF8F5] py-14 sm:py-20">
      <div className="mx-auto max-w-[108rem] px-3 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[87rem] space-y-16">
          {/* Hims-style centered checklist block (hims-checklist.jpg) */}
          <div className="rounded-[1.5rem] border border-black/8 bg-white px-6 py-12 sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-xl text-center font-display text-3xl font-normal leading-[1.1] tracking-[-0.04em] text-black sm:text-5xl">
              Dental care that feels like <span className="text-[#754B3D]">self-care</span>
            </h2>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="flex items-center justify-end border-b border-black/10 pb-3">
                <span className="text-xs font-semibold tracking-tight text-black">Pav Dental</span>
              </div>
              <ul className="divide-y divide-black/10">
                {CHECKLIST_ITEMS.map((item) => (
                  <li key={item} className="flex items-center justify-between gap-4 py-4">
                    <span className="text-sm text-black/85 sm:text-base">{item}</span>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-white">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="default" className="h-12 px-8 text-sm">
                <a href="#catalog">Browse Products</a>
              </Button>
            </div>
          </div>

          {/* FAQ Accordion Split */}
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.8fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Support
              </p>
              <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-black/65">
                Everything you need to know about our dental products, shipping, and returns.
              </p>
              <Button asChild size="sm" className="mt-6 h-10 px-6 text-xs">
                <a href="#catalog" className="inline-flex items-center gap-2">
                  <span>Browse Products</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </Button>
            </div>

            <div className="border-t border-black/10 divide-y divide-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] focus-visible:ring-offset-2"
                    >
                      <span className="text-sm font-medium text-black transition-colors group-hover:text-[#1B3745] sm:text-base">
                        {faq.q}
                      </span>
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-black/10 transition-transform duration-300 ${
                          isOpen ? "rotate-180 bg-black text-white border-black" : "bg-white text-black"
                        }`}
                      >
                        <ChevronDown className="size-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p className="text-sm leading-relaxed text-black/65">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
