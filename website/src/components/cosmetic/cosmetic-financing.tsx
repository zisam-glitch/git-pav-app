import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "bonding",
    label: "Composite Bonding",
    price: "From £150",
    monthly: "From £35/mo (0% APR)",
    description:
      "Direct aesthetic composite sculpting for chipped edges, black triangles, and minor shape corrections in a single visit.",
    includes: [
      "No enamel reduction",
      "Single-visit completion",
      "Full polish & shade match",
      "12-month treatment review",
    ],
    highlight: false,
  },
  {
    id: "veneers",
    label: "Porcelain Veneers",
    price: "From £595",
    monthly: "From £59/mo (0% APR)",
    description:
      "Bespoke laboratory-crafted E.max or feldspathic ceramic veneers for permanent symmetry, stain resistance, and high-gloss vitality.",
    includes: [
      "Digital 3D smile scan",
      "Trial smile physical mock-up",
      "Master ceramist layering",
      "15–20+ year expected lifespan",
    ],
    highlight: true,
  },
  {
    id: "implants",
    label: "Dental Implants",
    price: "From £1,850",
    monthly: "From £115/mo (0% APR)",
    description:
      "Permanent replacement for single or multiple missing teeth with titanium osseointegrated fixture and precision ceramic crown.",
    includes: [
      "3D CBCT radiological scan",
      "Computer-guided placement",
      "Zirconia / porcelain crown",
      "Lifetime implant guarantee",
    ],
    highlight: false,
  },
];

export function CosmeticFinancing() {
  return (
    <section id="financing" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Transparent Fees &amp; 0% APR Financing
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Spread the cost of your smile transformation with 0% interest-free monthly instalments over 12 to 24 months. No deposit required on qualifying plans.
          </p>
        </div>

        {/* Pricing & Financing Table */}
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
                <td className="py-4 px-6 font-bold text-[#2a1c12]">0% APR Plan</td>
                {TIERS.map((t) => (
                  <td
                    key={t.id}
                    className={`py-4 px-6 font-medium text-[#6b5848] ${
                      t.highlight ? "bg-[#faf6f0]   text-[#925a27] font-bold" : ""
                    }`}
                  >
                    {t.monthly}
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
                          Book Consultation <ArrowRight className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-full  text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]"
                      >
                        <a href={BOOKING_URL}>Book Consultation</a>
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-[#6b5848] max-w-2xl mx-auto">
          Written quotes provided at clinical assessment. 0% APR finance subject to status and FCA regulation. Zero upfront deposit on approved plans.
        </p>
      </div>
    </section>
  );
}
