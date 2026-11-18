import React from "react";

const FILLINGS = [
  {
    service: "Basic Composite",
    price: "£95",
    desc: "This pricing is generally for small composite fillings, typically used for minor tooth decay or small cavities. These fillings are ideal for restoring teeth with minimal structural damage. The procedure usually involves a straightforward treatment, often completed in one visit, and covers essential restoration needs.",
  },
  {
    service: "Intermediate Composite",
    price: "£145",
    desc: "Fillings are for moderate tooth decay or larger cavities, requiring detailed work. They involve extensive tooth preparation and careful shaping of the composite material. This tier includes fillings for areas with high biting force, needing durable and precise restorations for effective and long-lasting results.",
  },
  {
    service: "Advanced Composite",
    price: "£195",
    desc: "Advanced Composite Fillings are priced higher due to their complexity and materials. They treat significant decay or damage, covering multiple tooth surfaces or complex anatomy. These fillings require extensive shaping for proper bite and aesthetics, often needing time-consuming procedures or multiple visits.",
  },
];

export function GeneralDentistryFillingPricing() {
  return (
    <div className="rounded-xl bg-white   p-6 shadow-sm">
      <div className="mb-5 pb-4  ">
        <h3 className="font-display text-xl font-bold text-[#2a1c12]">White Fillings</h3>
        <p className="text-xs text-[#925a27] font-semibold mt-1">Natural-looking restoration</p>
      </div>

      <div className="space-y-4">
        {FILLINGS.map((row) => (
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