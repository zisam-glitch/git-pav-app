import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShopGuarantee() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
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

  return (
    <section id="guarantee" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a1c12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm text-[#6b5848] leading-relaxed">
              Everything you need to know about our dental products, shipping, and returns.
            </p>
            <Button
              asChild
              className="mt-6 bg-[#925a27] hover:bg-[#7a491e] text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
            >
              <a href="#catalog" className="flex items-center gap-2">
                Browse Products <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>

          {/* Right accordion */}
          <div className="divide-y divide-[#e8ddd0]">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="py-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group rounded-lg focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
                  >
                    <span
                      className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${
                        isOpen
                          ? "text-[#925a27]"
                          : "text-[#2a1c12] group-hover:text-[#925a27]"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <span
                      className={`flex-shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? "bg-[#925a27] text-white rotate-180"
                          : "bg-[#f0e8dc] text-[#925a27]"
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="pb-5 text-sm text-[#6b5848] leading-relaxed max-w-2xl">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

