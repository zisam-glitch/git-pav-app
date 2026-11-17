import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    id: "simple",
    label: "Simple Extraction",
    price: "£75",
    priceNote: "NHS Band 2: £23.80",
    description:
      "For visible, fully erupted teeth removable without surgical incision. Ideal for decayed, cracked, or mobile teeth.",
    includes: [
      "Local anaesthetic",
      "Digital X-ray",
      "Post-op instructions",
      "Aftercare pack",
    ],
    highlight: false,
  },
  {
    id: "surgical",
    label: "Surgical Extraction",
    price: "£195",
    priceNote: "NHS Band 2: £73.50",
    description:
      "For broken, impacted, or deeply rooted teeth requiring incision and possible sectioning for safe removal.",
    includes: [
      "Everything in Simple",
      "Surgical incision & stitches",
      "Sedation option available",
      "Follow-up appointment",
    ],
    highlight: true,
  },
  {
    id: "wisdom",
    label: "Impacted Wisdom Tooth",
    price: "£295",
    priceNote: "NHS Band 2: £73.50",
    description:
      "Specialist removal of fully or partially impacted wisdom teeth. Panoramic X-ray included for surgical planning.",
    includes: [
      "Panoramic X-ray (OPG)",
      "Surgical removal",
      "IV sedation available",
      "Full aftercare & review",
    ],
    highlight: false,
  },
];

export function ExtractionPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Transparent Extraction Pricing
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base">
            No hidden charges. All fees include clinical assessment, anaesthetic
            and aftercare. NHS rates available for eligible patients.
          </p>
        </div>

        {/* Pricing table */}
        <div className="overflow-x-auto rounded-xl border border-[#e2d4c0] bg-white shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#e2d4c0] text-[#925a27] font-bold uppercase text-[11px] sm:text-xs">
                <th className="py-5 px-6 bg-white w-1/4">Treatment</th>
                {TIERS.map((t) => (
                  <th
                    key={t.id}
                    className={`py-5 px-6 w-1/4 ${t.highlight ? "bg-[#faf6f0] border-x border-[#e2d4c0] text-[#925a27] relative" : "bg-white"}`}
                  >
                    {t.highlight && (
                      <div className="inline-block bg-[#925a27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                        Most Popular
                      </div>
                    )}
                    <div>{t.label}</div>
                    <div className={`text-base sm:text-lg font-display font-bold mt-0.5 ${t.highlight ? "text-[#925a27]" : "text-[#2a1c12]"}`}>
                      {t.price}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ddd0]/70 text-[#2a1c12]">
              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">NHS Rate</td>
                {TIERS.map((t) => (
                  <td key={t.id} className={`py-4 px-6 text-[#6b5848] ${t.highlight ? "bg-[#faf6f0] border-x border-[#e2d4c0]" : ""}`}>
                    {t.priceNote}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Description</td>
                {TIERS.map((t) => (
                  <td key={t.id} className={`py-4 px-6 text-[#6b5848] text-xs leading-relaxed ${t.highlight ? "bg-[#faf6f0] border-x border-[#e2d4c0]" : ""}`}>
                    {t.description}
                  </td>
                ))}
              </tr>
              {[0, 1, 2, 3].map((idx) => (
                <tr key={idx}>
                  <td className="py-4 px-6 font-bold text-[#2a1c12]">
                    {idx === 0 ? "Includes" : ""}
                  </td>
                  {TIERS.map((t) => (
                    <td key={t.id} className={`py-4 px-6 ${t.highlight ? "bg-[#faf6f0] border-x border-[#e2d4c0] font-bold text-emerald-800" : "text-[#2a1c12]"}`}>
                      <span className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#cf9448] flex-shrink-0" />
                        {t.includes[idx]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#fffdf9]">
                <td className="py-5 px-6 font-bold text-[#2a1c12]">Action</td>
                {TIERS.map((t) => (
                  <td key={t.id} className={`py-5 px-6 ${t.highlight ? "bg-[#faf6f0] border-x border-[#e2d4c0]" : ""}`}>
                    {t.highlight ? (
                      <Button asChild className="w-full accent-gradient text-white rounded-full text-xs font-bold shadow hover:opacity-95">
                        <a href="/contact-us" className="flex items-center gap-2">
                          Book Now <ArrowRight className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full rounded-full border-[#925a27] text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]">
                        <a href="/contact-us">Book Now</a>
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-[#9a8674] max-w-2xl mx-auto">
          Prices may vary with complexity assessed at consultation. NHS eligibility subject to clinical need. 0% APR finance on treatments over £250.
        </p>
      </div>
    </section>
  );
}
