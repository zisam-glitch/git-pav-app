import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What is the difference between full and partial dentures?",
    a: "Full (complete) dentures replace all natural teeth in either the upper or lower jaw, resting directly on the gum ridge and relying on natural suction and muscle tone for retention. Partial dentures replace one or several missing teeth while retaining your remaining natural teeth, securing in place via discreet metal or flexible gum-colored clasps.",
  },
  {
    q: "How long do dentures usually last?",
    a: "With daily cleaning and proper care, a high-quality acrylic or chrome denture typically lasts 5 to 8 years. Over time, your jawbone and gums naturally shrink (resorb), which may cause the denture to loosen. Periodic laboratory relining restores a snug fit throughout its lifespan.",
  },
  {
    q: "Will my dentures look like natural teeth?",
    a: "Yes! Gone are the days of artificial, flat-looking false teeth. Our prosthetics feature multi-layered composite teeth that replicate natural light transmission, subtle surface textures, individualized shading, and realistic stippled pink gum work tailored to your age and facial profile.",
  },
  {
    q: "How long does it take to get used to new dentures?",
    a: "Most patients adjust within 2 to 4 weeks. Initially, you may experience minor excess saliva and speech adjustments with 's' and 'th' sounds. Practicing reading aloud and eating soft foods cut into small pieces will rapidly accelerate your comfort.",
  },
  {
    q: "Can dentures be repaired if dropped or cracked?",
    a: "Yes. Our on-site dental laboratory provides fast same-day emergency denture repairs. Whether an acrylic base has fractured in half, a clasp has broken, or an additional natural tooth needs to be added to an existing denture, we can usually complete repairs within 1 to 3 hours.",
  },
  {
    q: "What are implant-retained dentures?",
    a: "Implant-retained overdentures are removable prosthetics that snap securely onto 2 to 4 titanium dental implants placed in your jawbone. This provides rock-solid stability, eliminating wobbling, sore spots, speech slips, and the need for messy denture adhesive creams.",
  },
  {
    q: "Can I eat normally with my new dentures?",
    a: "Yes! Modern precision-balanced dentures restore your ability to enjoy a diverse, nutritious diet. We recommend starting with softer items (eggs, pasta, fish, steamed vegetables) before progressing to harder foods, and chewing evenly using both sides of your mouth.",
  },
  {
    q: "How should I clean and maintain my dentures?",
    a: "Clean your dentures daily using a soft-bristled denture brush and non-abrasive cleanser or mild soap (avoid regular abrasive toothpaste). Always clean over a basin filled with water or a folded towel to cushion against accidental drops, and soak them in fresh water or cleaning solution overnight.",
  },
  {
    q: "Are dentures available on the NHS at Pav Dental?",
    a: "Yes. We offer NHS Band 3 dentures (£319.10) for registered NHS patients requiring tooth replacement. We also provide our premium private options (such as lightweight Cobalt Chrome and flexible Valplast) for patients seeking elevated cosmetic aesthetics and thinner frameworks.",
  },
  {
    q: "Do you offer home visits or mobile denture care?",
    a: "Yes! For elderly, housebound, or care home residents across Bradford who cannot easily travel to our clinic, Pav Dental operates dedicated mobile dental units capable of taking impressions, delivering try-ins, and fitting dentures in the comfort of your home.",
  },
];

export function DenturesFaq() {
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
              Everything you need to know about dentures, fittings, adjustments, and care.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                Book Denture Assessment <ArrowRight className="size-3.5" />
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
