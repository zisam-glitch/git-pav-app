import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "Are custom dental grillz safe for my teeth and enamel?",
    a: "Yes — when properly fitted by a dentist. Because our clinical dental team takes accurate medical-grade intraoral impressions, your grill is custom-cast to slide on and off smoothly without scraping enamel or abrading gums.",
  },
  {
    q: "Why get grillz at Pav Dental instead of an online mold kit?",
    a: "At-home putty kits often distort before setting, creating ill-fitting grillz that trap bacteria or irritate gums. At Pav Dental, a dentist inspects your oral health first, takes professional impressions, and verifies the final fit.",
  },
  {
    q: "Are the grillz permanent or removable?",
    a: "All our custom grillz are 100% removable. They clip securely over your natural teeth using snug retention and can be popped off in seconds for eating, brushing, and sleeping.",
  },
  {
    q: "What is the difference between 10k, 14k, and 18k gold?",
    a: "10k gold is the hardest, most durable alloy for daily wear. 14k gold offers a richer warm tone while maintaining strong durability. 18k gold provides deep luster and high purity for statement pieces.",
  },
  {
    q: "How long does the production process take?",
    a: "Standard turnaround from your dental impression to delivery is 7 to 10 working days. Priority express options are available upon request for upcoming shoots or events.",
  },
  {
    q: "Can I eat or drink with my grillz in?",
    a: "We advise removing your grillz before eating food or drinking sugary or acidic beverages so food particles are not trapped against enamel. Drinking plain water while wearing them is fine.",
  },
  {
    q: "How do I clean and polish my gold grillz?",
    a: "Rinse your grillz in lukewarm water after removal, clean gently with a soft toothbrush and mild non-abrasive soap, and buff with the polishing cloth provided in your case.",
  },
  {
    q: "What diamonds are used in your diamond grillz?",
    a: "We set natural, conflict-free VVS1–VVS2 clarity, F/G color round brilliant cut diamonds in micro-prong settings for maximum sparkle and secure retention.",
  },
];

export function GrillzFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Grillz questions,{" "}
              <span className="text-[#754B3D]">answered</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Everything you need to know about dental jewelry, gold purity, fitting appointments,
              and aftercare.
            </p>
            <Button asChild className="mt-7">
              <a href={BOOKING_URL}>
                Book Impression
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="divide-y divide-black/10 border-t border-b border-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:text-[#1B3745]"
                    >
                      <span className="font-display text-lg font-normal tracking-[-0.02em] text-black sm:text-xl">
                        {faq.q}
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-black">
                        {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pb-6 pr-12">
                        <p className="text-sm leading-relaxed text-black/65 sm:text-base">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
