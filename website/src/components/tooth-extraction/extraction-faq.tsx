import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "Does a tooth extraction hurt?",
    a: "Not during the procedure — local anaesthetic completely numbs the area so you should feel only pressure, not pain. If you feel any sharp sensation, tell your dentist immediately. There will be some soreness for 2–4 days after, manageable with over-the-counter painkillers like ibuprofen and paracetamol.",
  },
  {
    q: "How long does a tooth extraction take?",
    a: "A simple extraction typically takes 15–30 minutes. A surgical or wisdom tooth extraction can take 30–90 minutes depending on complexity. Your dentist will give you an estimate after reviewing your X-ray.",
  },
  {
    q: "Can I eat before my extraction appointment?",
    a: "Yes — for a standard extraction under local anaesthetic you can eat normally beforehand. If you are having IV sedation, you must fast (no food or drink except water) for at least 6 hours beforehand. We will confirm this at the time of booking.",
  },
  {
    q: "How long is the recovery time?",
    a: "Most patients return to normal daily activities within 1–2 days. The gum tissue heals fully in 3–4 weeks, and the underlying bone remodels over 3–6 months. Surgical and wisdom tooth extractions may take a few extra days to recover.",
  },
  {
    q: "What is a dry socket and how do I avoid it?",
    a: "Dry socket occurs when the blood clot in the tooth socket is dislodged or dissolves before the wound heals. To avoid it: don't use straws, don't rinse vigorously for 24 hours, don't smoke, and avoid hot food and drinks for the first 24 hours.",
  },
  {
    q: "Can I drive home after my extraction?",
    a: "Yes, if you had only local anaesthetic — you can drive as soon as the numbness wears off (usually 2–3 hours). If you had IV sedation you must not drive or operate machinery for 24 hours and will need someone to accompany you home.",
  },
  {
    q: "What happens to the gap left by the tooth?",
    a: "We will discuss replacement options with you at or after the extraction. Options include dental implants, a bridge, or a partial denture. We recommend waiting at least 3 months for the bone to heal before implant placement.",
  },
  {
    q: "Are NHS extractions available at Pav Dental?",
    a: "Yes. NHS Band 2 treatment (£73.50) covers surgical and wisdom tooth extractions. Simple extractions under Band 2 are also covered. NHS availability is subject to clinical need and current NHS contract capacity — call us to check.",
  },
];

export function ExtractionFaq() {
  const [open, setOpen] = useState<number | null>(0);

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
              Everything you need to know about tooth extractions — answered by
              our clinical team.
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

          {/* Right — accordion */}
          <div className="divide-y divide-[#e8ddd0]">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="py-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
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
