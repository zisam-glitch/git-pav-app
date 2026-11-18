import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic-composite",
    label: "Basic Composite",
    price: "£95",
    category: "Small Fillings",
    description:
      "This pricing is generally for small composite fillings, typically used for minor tooth decay or small cavities. These fillings are ideal for restoring teeth with minimal structural damage. The procedure usually involves a straightforward treatment, often completed in one visit, and covers essential restoration needs.",
    includes: [
      "Minor tooth decay treatment",
      "Small cavity restoration",
      "Single visit procedure",
      "Essential restoration",
    ],
    highlight: false,
  },
  {
    id: "intermediate-composite",
    label: "Intermediate Composite",
    price: "£145",
    category: "Moderate Fillings",
    description:
      "Fillings are for moderate tooth decay or larger cavities, requiring detailed work. They involve extensive tooth preparation and careful shaping of the composite material. This tier includes fillings for areas with high biting force, needing durable and precise restorations for effective and long-lasting results.",
    includes: [
      "Moderate decay treatment",
      "Large cavity restoration",
      "High biting force areas",
      "Durable precise restorations",
    ],
    highlight: true,
  },
  {
    id: "advanced-composite",
    label: "Advanced Composite",
    price: "£195",
    category: "Complex Fillings",
    description:
      "Advanced Composite Fillings are priced higher due to their complexity and materials. They treat significant decay or damage, covering multiple tooth surfaces or complex anatomy. These fillings require extensive shaping for proper bite and aesthetics, often needing time-consuming procedures or multiple visits.",
    includes: [
      "Significant decay treatment",
      "Multiple surface restoration",
      "Complex anatomy work",
      "Aesthetic bite alignment",
    ],
    highlight: false,
  },
];

export function GeneralDentistryFillingPricingTable() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            White Filling Prices
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Natural-looking composite fillings with transparent pricing. From basic repairs to advanced restorations, we offer options for every need.
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
          All composite fillings use tooth-colored materials for natural aesthetics. Treatment complexity determined by clinical assessment. Written quotes provided before treatment.
        </p>
      </div>
    </section>
  );
}