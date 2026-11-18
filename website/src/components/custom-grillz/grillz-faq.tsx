import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "Are custom dental grillz safe for my teeth and enamel?",
    a: "Yes — when properly fitted by a dentist! Because our clinical dental team takes accurate medical-grade intraoral impressions, your grill is custom-cast to slide on and off with gentle frictional suction. It does not scrape enamel, abrade gums, or force teeth out of alignment. Cheap DIY online molds frequently cause enamel damage, bite trauma, and gum recession.",
  },
  {
    q: "Why get grillz at Pav Dental instead of an online mold kit?",
    a: "Online companies send you silicone putty to mix at home, which almost always distorts before setting, resulting in ill-fitting grillz that rock, trap bacteria, or cut into gum tissue. At Pav Dental, a qualified dental surgeon inspects your oral health, ensures zero active cavities or gum disease, takes professional impressions, and inspects the final fit.",
  },
  {
    q: "Are the grillz permanent or removable?",
    a: "All our custom grillz are 100% removable. They clip securely over your natural teeth using snug biological retention and can be popped off in seconds for eating, brushing, sleeping, or working.",
  },
  {
    q: "What is the difference between 10k, 14k, and 18k gold?",
    a: "10k gold contains 41.7% pure gold; it is the hardest, most durable alloy and highly resistant to daily wear. 14k gold (58.3% pure gold) offers a richer warm yellow tone while maintaining excellent hardness. 18k gold (75% pure gold) offers deep, luxurious luster and prestigious purity, ideal for high-end statement pieces.",
  },
  {
    q: "How long does the production process take?",
    a: "Standard turnaround from your dental impression to delivery is 7 to 10 working days. An express 3 to 5-day priority rush service is also available upon request for upcoming shoots, events, or celebrations.",
  },
  {
    q: "Can I eat, drink, or smoke with my grillz in?",
    a: "We strongly advise removing your grillz before eating food or drinking sugary/acidic liquids. Food particles trapped under dental caps can promote rapid bacterial growth and plaque buildup. Drinking clear water while wearing grillz is completely fine.",
  },
  {
    q: "Can I get grillz if I have missing teeth or minor crowding?",
    a: "Yes! Because each cap is custom wax-carved by hand on a stone replica of your teeth, we can create bridge connectors across a missing tooth space, or contour caps to harmonize with slightly crowded or crooked teeth.",
  },
  {
    q: "How do I clean and polish my gold grillz?",
    a: "Rinse your grillz in lukewarm water after removal, clean gently with a soft toothbrush and non-abrasive dish soap, and buff with the microfiber polishing cloth provided in your luxury case. Never boil your grillz or clean them with harsh bleach or household chemicals.",
  },
  {
    q: "What diamonds are used in your iced-out diamond grillz?",
    a: "We exclusively set natural, conflict-free VVS1–VVS2 clarity, F/G color round brilliant cut diamonds. Each stone is individually hand-seated in micro-prongs by our master diamond setters to guarantee zero loose stones and maximum scintillation.",
  },
];

export function GrillzFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a1c12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm text-[#6b5848] leading-relaxed">
              Everything you need to know about dental jewelry, gold alloys, fitting appointments, and care.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                Book Impression <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>

          {/* Right accordion */}
          <div className="divide-y divide-[#e8ddd0]">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="py-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
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
                          ? "accent-gradient text-white rotate-180"
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
