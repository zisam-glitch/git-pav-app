import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic-root-canal",
    label: "Basic Root Canal",
    price: "£195",
    category: "Single Root",
    description:
      "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines). These teeth usually have a straightforward root canal system, which makes the treatment less complicated and time-consuming.",
    includes: [
      "Front teeth treatment",
      "Single root canals",
      "Straightforward procedure",
      "Quick treatment time",
    ],
    highlight: false,
  },
  {
    id: "intermediate-root-canal",
    label: "Intermediate Root Canal",
    price: "£295",
    category: "Two Roots",
    description:
      "This pricing tier is generally for root canal treatments on premolars or teeth with two roots. The procedure in this category may be more complex than a standard root canal due to the presence of multiple roots and potentially more intricate root canal systems.",
    includes: [
      "Premolar treatment",
      "Two root canals",
      "Multiple root systems",
      "Complex procedure",
    ],
    highlight: true,
  },
  {
    id: "advanced-root-canal",
    label: "Advanced Root Canal",
    price: "£395",
    category: "Multiple Roots",
    description:
      "This is for the most complex root canal treatments, typically involving molars, which have multiple roots and a more complex root canal system. These procedures are often more time-consuming and require advanced techniques and equipment, justifying the higher price.",
    includes: [
      "Molar treatment",
      "Multiple root canals",
      "Advanced techniques",
      "Specialized equipment",
    ],
    highlight: false,
  },
];

export function GeneralDentistryRootCanalPricingTable() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Root Canal Prices
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Save your natural tooth with expert root canal therapy. From simple front teeth to complex molars, we provide specialized care for every case.
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
          Root canal complexity determined by tooth type and root canal system. X-ray and examination required for accurate pricing. Crown restoration not included.
        </p>
      </div>
    </section>
  );
}