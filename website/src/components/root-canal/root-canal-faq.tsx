import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What is a root canal treatment?",
    a: "Root canal treatment (endodontic therapy) is a routine dental procedure designed to save an infected, inflamed, or dead tooth pulp. The infected nerve and blood vessels inside the root canals are carefully removed, chemically disinfected and shaped, then hermetically sealed with biocompatible gutta-percha.",
  },
  {
    q: "When is a root canal needed?",
    a: "A root canal is necessary when bacteria penetrate deep into the pulp chamber of the tooth due to deep cavities, cracked enamel, repeated dental procedures, or trauma.",
  },
  {
    q: "Is a root canal painful?",
    a: "No! Modern localized anaesthesia, digital delivery systems, and flexible rotary instruments make having a root canal no more uncomfortable than receiving a standard dental filling. The procedure actively eliminates throbbing toothache.",
  },
  {
    q: "What happens during the procedure?",
    a: "Your tooth is thoroughly numbed, isolated with a sterile rubber dam, and cleaned with specialized nickel-titanium instruments to its exact microscopic apex under magnification. Disinfecting ultrasonic rinses clear remaining bacteria before the space is filled and sealed.",
  },
  {
    q: "How long does the appointment take?",
    a: "Most single-canal anterior teeth take approximately 45 to 60 minutes. Complex posterior molars with 3 or 4 curved canals typically require 60 to 90 minutes.",
  },
  {
    q: "What is the success rate of root canal treatment?",
    a: "Root canal therapy has an exceptional long-term success rate of over 95%. When followed by a well-fitted protective crown, a root-treated tooth can last for decades or a lifetime.",
  },
  {
    q: "Will I need a crown after a root canal?",
    a: "In posterior premolars and molars bearing heavy chewing forces, a dental crown is strongly recommended to encircle and reinforce the tooth against fracture.",
  },
  {
    q: "What are the alternatives to a root canal?",
    a: "The only biological alternative to removing an infected dental nerve is complete extraction. However, preserving your own natural root remains the gold biological standard.",
  },
  {
    q: "Can I eat normally after the procedure?",
    a: "Wait until numbness completely wears off (typically 2 to 3 hours) before eating. While a temporary restoration is in place, avoid chewing hard foods on that side.",
  },
];

export function RootCanalFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a1c12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm text-[#6b5848] leading-relaxed">
              Everything you need to know about endodontic treatment, recovery, and tooth preservation.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                Book Consultation <ArrowRight className="size-3.5" />
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
