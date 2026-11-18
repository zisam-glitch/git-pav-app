import React from "react";

const EXTRACTIONS = [
  {
    service: "Simple Extraction",
    price: "£95",
    desc: "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
  },
  {
    service: "Intermediate Extraction",
    price: "£145",
    desc: "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
  },
  {
    service: "Complex Extraction",
    price: "£195",
    desc: "Complex extractions involve surgical procedures, such as removing impacted teeth or those with complicated root structures. They typically require incisions, bone removal, and sometimes sectioning the tooth into multiple parts for easier removal.",
  },
];

export function GeneralDentistryExtractionPricing() {
  return (
    <div className="rounded-xl bg-white   p-6 shadow-sm">
      <div className="mb-5 pb-4  ">
        <h3 className="font-display text-xl font-bold text-[#2a1c12]">Tooth Extraction</h3>
        <p className="text-xs text-[#925a27] font-semibold mt-1">Safe tooth removal</p>
      </div>

      <div className="space-y-4">
        {EXTRACTIONS.map((row) => (
          <div key={row.service} className="pb-4  /50 last:border-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm sm:text-base font-semibold text-[#2a1c12]">{row.service}</span>
              <span className="text-base sm:text-lg font-bold text-[#925a27] font-display whitespace-nowrap">
                {row.price}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6b5848] leading-relaxed">
              {row.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}