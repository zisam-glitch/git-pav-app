import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic",
    title: "Basic Care",
    price: "£195",
    toothType: "Incisors & Canines",
    canals: "1 Single Canal",
    description:
      "Treatment for anterior front teeth with single straight root canals. Fast, gentle relief restoring tooth structure.",
    includes: [
      "Diagnostic digital X-rays",
      "Painless localized anaesthesia",
      "Rotary cleaning & sterile debridement",
      "Biocompatible temporary core seal",
    ],
    highlight: false,
    tag: "Front Teeth",
  },
  {
    id: "intermediate",
    title: "Intermediate Care",
    price: "£275",
    toothType: "Premolars",
    canals: "1–2 Root Canals",
    description:
      "For mid-arch premolar teeth with one or two interconnected root canals, requiring precision apex tracking and thermal seal.",
    includes: [
      "Everything in Basic Care",
      "Electronic apex locator tracking",
      "Flexible WaveOne Gold rotary files",
      "Ultrasonic irrigation disinfection",
    ],
    highlight: true,
    tag: "Most Common",
  },
  {
    id: "advanced",
    title: "Advanced Care",
    price: "£375",
    toothType: "Molars & Complex",
    canals: "3–4 Complex Canals",
    description:
      "Specialist care for posterior molars featuring 3 to 4 curved, branching, or calcified canals treated under high surgical magnification.",
    includes: [
      "Operating microscope guidance",
      "Treatment of calcified / curved roots",
      "Warm vertical compaction obturation",
      "Coronal core build-up for crown",
    ],
    highlight: false,
    tag: "Complex Molars",
  },
];

export function RootCanalPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Transparent Root Canal Pricing
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Clear upfront fees tailored to the anatomy of your tooth. Zero hidden charges; NHS Band rates and 0% APR finance available.
          </p>
        </div>

        {/* Pricing Comparison Table */}
        <div className="overflow-x-auto rounded-xl   bg-white shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="  text-[#925a27] font-bold uppercase text-[11px] sm:text-xs">
                <th className="py-5 px-6 bg-white w-1/4">Tooth Anatomy</th>
                {TIERS.map((t) => (
                  <th
                    key={t.id}
                    className={`py-5 px-6 w-1/4 ${
                      t.highlight
                        ? "bg-[#faf6f0]   text-[#925a27] relative"
                        : "bg-white"
                    }`}
                  >
                    {t.highlight && (
                      <div className="inline-block bg-[#925a27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                        {t.tag}
                      </div>
                    )}
                    <div>{t.toothType}</div>
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
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Canals Cleaned</td>
                {TIERS.map((t) => (
                  <td
                    key={t.id}
                    className={`py-4 px-6 font-semibold ${
                      t.highlight ? "bg-[#faf6f0]   text-[#925a27]" : "text-[#6b5848]"
                    }`}
                  >
                    {t.canals}
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
                        <Check className="size-3.5 text-primary flex-shrink-0" />
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
                          Book Treatment <ArrowRight className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-full  text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]"
                      >
                        <a href={BOOKING_URL}>Book Treatment</a>
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-[#6b5848] max-w-2xl mx-auto">
          NHS Band 2 and Band 3 endodontic treatments are also provided for eligible patients based on clinical necessity. 0% APR finance available on treatments over £250.
        </p>
      </div>
    </section>
  );
}
