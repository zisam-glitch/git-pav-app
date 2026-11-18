import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "simple-extraction",
    label: "Simple Extraction",
    price: "£95",
    category: "Visible Teeth",
    description:
      "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
    includes: [
      "Fully erupted teeth",
      "Simple root structures",
      "Non-surgical procedure",
      "Quick recovery time",
    ],
    highlight: false,
  },
  {
    id: "intermediate-extraction",
    label: "Intermediate Extraction",
    price: "£145",
    category: "Complex Cases",
    description:
      "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
    includes: [
      "Broken at gum line",
      "Partially erupted teeth",
      "Tooth sectioning",
      "Bone removal if needed",
    ],
    highlight: true,
  },
  {
    id: "complex-extraction",
    label: "Complex Extraction",
    price: "£195",
    category: "Surgical",
    description:
      "Complex extractions involve surgical procedures, such as removing impacted teeth or those with complicated root structures. They typically require incisions, bone removal, and sometimes sectioning the tooth into multiple parts for easier removal.",
    includes: [
      "Impacted teeth",
      "Complicated roots",
      "Surgical incisions",
      "Bone removal procedures",
    ],
    highlight: false,
  },
];

export function GeneralDentistryExtractionPricingTable() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Tooth Extraction Prices
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Safe and professional tooth removal services. From simple extractions to complex surgical procedures, we ensure patient comfort and care.
          </p>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto rounded-xl   bg-white shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="  text-[#925a27] font-bold uppercase text-[11px] sm:text-xs">
                <th className="py-5 px-6 bg-white w-1/4">Treatment</th>
                {TIERS.map((t) => (
                  <th
                    key={t.id}
                    className={`py-5 px-6 w-1/4 ${
                      t.highlight
                        ? "bg-[#faf6f0]   text-[#925a27] relative"
                        : "bg-white"
                    }`}
                  >
                    <div>{t.label}</div>
                    <div
                      className={`text-base sm:text-lg font-display font-bold mt-0.5 ${
                        t.highlight ? "text-[#925a27]" : "text-[#2a1c12]"
                      }`}
                    >
                      {t.price}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className=" /70 text-[#2a1c12]">
              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Category</td>
                {TIERS.map((t) => (
                  <td
                    key={t.id}
                    className={`py-4 px-6 font-medium text-[#6b5848] ${
                      t.highlight ? "bg-[#faf6f0]   text-[#925a27] font-bold" : ""
                    }`}
                  >
                    {t.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Description</td>
                {TIERS.map((t) => (
                  <td
                    key={t.id}
                    className={`py-4 px-6 text-[#6b5848] text-xs leading-relaxed ${
                      t.highlight ? "bg-[#faf6f0]  " : ""
                    }`}
                  >
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
                    <td
                      key={t.id}
                      className={`py-4 px-6 ${
                        t.highlight
                          ? "bg-[#faf6f0]   font-bold text-emerald-800"
                          : "text-[#2a1c12]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#925a27] flex-shrink-0" />
                        {t.includes[idx]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#fffdf9]">
                <td className="py-5 px-6 font-bold text-[#2a1c12]">Action</td>
                {TIERS.map((t) => (
                  <td
                    key={t.id}
                    className={`py-5 px-6 ${
                      t.highlight ? "bg-[#faf6f0]  " : ""
                    }`}
                  >
                    {t.highlight ? (
                      <Button
                        asChild
                        className="w-full accent-gradient text-white rounded-full text-xs font-bold shadow hover:opacity-95"
                      >
                        <a href={BOOKING_URL} className="flex items-center justify-center gap-2">
                          Book Appointment <ArrowRight className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-full  text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]"
                      >
                        <a href={BOOKING_URL}>Book Appointment</a>
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-[#6b5848] max-w-2xl mx-auto">
          Extraction complexity determined by X-ray and clinical examination. Local anesthesia provided for all procedures. Aftercare instructions included.
        </p>
      </div>
    </section>
  );
}