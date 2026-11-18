import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What is Cosmetic Dentistry?",
    a: "Cosmetic dentistry refers to dental treatments specifically designed to enhance the aesthetics, symmetry, alignment, and color of your smile. Treatments range from single-tooth composite bonding and custom porcelain veneers to full-mouth rehabilitation and clear aligners.",
  },
  {
    q: "How long do porcelain veneers last?",
    a: "High-quality porcelain veneers typically last between 15 to 20+ years with proper oral hygiene and regular dental check-ups. Because medical-grade porcelain is non-porous, veneers will never discolour or stain from coffee, tea, or wine.",
  },
  {
    q: "Is cosmetic dental treatment painful?",
    a: "Not at all. We utilize modern gentle local anaesthetics, computer-guided numbing, and minimally invasive techniques to ensure complete comfort throughout every procedure. Conscious sedation options are also readily available.",
  },
  {
    q: "What is the difference between composite bonding and porcelain veneers?",
    a: "Composite bonding is applied in a single appointment by hand-sculpting aesthetic resin onto the tooth with minimal or no enamel removal, lasting 5–8 years. Porcelain veneers are custom ceramic shells offering superior translucency, stain resistance, and durability lasting 15–20+ years.",
  },
  {
    q: "How much does a smile makeover cost?",
    a: "Because every smile makeover is tailored to your unique anatomical goals, pricing varies. Single-tooth composite bonding starts from £150, while bespoke porcelain veneers start from £595 per tooth. We provide full itemized quotes and 0% APR finance from £35/month.",
  },
  {
    q: "Can cosmetic dentistry fix crooked teeth without braces?",
    a: "Yes! Minor crowding, gaps, and rotated teeth can frequently be corrected instantly using porcelain veneers or composite bonding. For moderate to severe misalignment, we also provide clear aligner systems.",
  },
  {
    q: "Are cosmetic treatments covered by the NHS?",
    a: "Cosmetic dental procedures performed purely for aesthetic improvement are classified as private treatments. However, if a tooth requires a restoration due to severe decay or trauma affecting oral health, NHS Band 3 coverage may apply.",
  },
  {
    q: "Will my new smile look natural?",
    a: "Absolutely. Our master ceramists layer multi-tonal porcelains with natural incisal translucency and bespoke micro-surface texture to ensure your new smile looks seamlessly authentic in every lighting condition.",
  },
  {
    q: "How long does the entire makeover process take?",
    a: "Composite bonding is completed in a single 1 to 2-hour appointment. Porcelain veneers typically require two visits spaced 1 to 2 weeks apart: visit one for digital scans and trial smile mock-up, and visit two for permanent bonding.",
  },
  {
    q: "What financing options are available?",
    a: "We offer 0% APR interest-free payment plans spread over 12 to 24 months, with zero deposit required on approved credit. You can spread repayments into predictable monthly amounts starting from £35/month.",
  },
];

export function CosmeticFaq() {
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
              Everything you need to know about smile design, veneer longevity, composite bonding, and fees.
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
