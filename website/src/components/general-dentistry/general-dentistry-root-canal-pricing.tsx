import React from "react";

const ROOT_CANAL = [
  {
    service: "Basic Root Canal",
    price: "£195",
    desc: "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines). These teeth usually have a straightforward root canal system, which makes the treatment less complicated and time-consuming.",
  },
  {
    service: "Intermediate Root Canal",
    price: "£295",
    desc: "This pricing tier is generally for root canal treatments on premolars or teeth with two roots. The procedure in this category may be more complex than a standard root canal due to the presence of multiple roots and potentially more intricate root canal systems.",
  },
  {
    service: "Advanced Root Canal",
    price: "£395",
    desc: "This is for the most complex root canal treatments, typically involving molars, which have multiple roots and a more complex root canal system. These procedures are often more time-consuming and require advanced techniques and equipment, justifying the higher price.",
  },
];

export function GeneralDentistryRootCanalPricing() {
  return (
    <div className="rounded-xl bg-white   p-6 shadow-sm">
      <div className="mb-5 pb-4  ">
        <h3 className="font-display text-xl font-bold text-[#2a1c12]">Root Canal</h3>
        <p className="text-xs text-[#925a27] font-semibold mt-1">Save your natural tooth</p>
      </div>

      <div className="space-y-4">
        {ROOT_CANAL.map((row) => (
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