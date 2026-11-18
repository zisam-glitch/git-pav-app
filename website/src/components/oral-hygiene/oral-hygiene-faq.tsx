import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "How often should I have a dental hygiene appointment?",
    a: "For most patients, we recommend a professional hygiene appointment every 6 months. However, if you have a history of gum disease, are prone to plaque buildup, or have certain medical conditions, your dentist may recommend more frequent visits every 3-4 months.",
  },
  {
    q: "What's the difference between a scale and polish and a routine hygiene appointment?",
    a: "A scale and polish focuses specifically on removing plaque and tartar buildup and polishing teeth. A routine hygiene appointment is more comprehensive, including the cleaning plus a full oral health assessment, gum examination, oral cancer screening, and personalized hygiene advice.",
  },
  {
    q: "Is dental hygiene treatment painful?",
    a: "Most hygiene treatments are not painful. You may feel some sensitivity or mild discomfort during scaling, especially if you have sensitive teeth or gum inflammation. Our hygienists are trained to work gently and can use numbing gel or local anesthesia if needed for your comfort.",
  },
  {
    q: "What are the signs that I need gum disease treatment?",
    a: "Common signs include red, swollen, or bleeding gums (especially when brushing), persistent bad breath, receding gums, loose teeth, or changes in your bite. If you notice any of these symptoms, schedule an appointment promptly for assessment and treatment.",
  },
  {
    q: "Are fissure sealants suitable for adults?",
    a: "While fissure sealants are most commonly applied to children's teeth as a preventative measure, adults can also benefit from them, particularly if they have deep grooves in their molars that are prone to decay or if they're at higher risk for cavities.",
  },
  {
    q: "How long does a typical hygiene appointment take?",
    a: "A standard scale and polish typically takes 30-45 minutes. A comprehensive routine hygiene appointment usually takes 45-60 minutes. More complex treatments like deep cleaning for gum disease may take 60-90 minutes and may require multiple visits.",
  },
  {
    q: "Can dental hygiene treatment whiten my teeth?",
    a: "While a scale and polish can remove some surface stains and make teeth appear brighter, it's not a whitening treatment. For significant whitening results, we recommend professional whitening treatments. However, good hygiene helps maintain whitening results and prevents new stains.",
  },
  {
    q: "What should I do between hygiene appointments?",
    a: "Maintain good home care by brushing twice daily with fluoride toothpaste, flossing daily, using interdental brushes as recommended, and limiting sugary foods and drinks. Your hygienist will provide personalized advice based on your specific oral health needs.",
  },
];

export function OralHygieneFaq() {
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
              Everything you need to know about dental hygiene services, gum disease prevention, and maintaining optimal oral health.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                Book Appointment <ArrowRight className="size-3.5" />
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