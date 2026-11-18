const ROOT_CANAL = [
  {
    service: "Basic Root Canal",
    price: "£195",
    desc: "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines).",
  },
  {
    service: "Intermediate Root Canal",
    price: "£295",
    desc: "This pricing tier is generally for root canal treatments on premolars or teeth with two roots.",
  },
  {
    service: "Advanced Root Canal",
    price: "£395",
    desc: "For complex root canal treatments, typically involving molars with multiple roots and intricate root canal systems.",
  },
];

export function GeneralDentistryRootCanalPricing() {
  return (
    <div className="hims-tile-warm rounded-[1.5rem] border border-black/6 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="border-b border-black/8 pb-4">
        <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
          Root Canal
        </h3>
        <p className="mt-1 text-xs font-medium text-[#754B3D]">Save your natural tooth</p>
      </div>

      <div className="divide-y divide-black/8">
        {ROOT_CANAL.map((row) => (
          <div key={row.service} className="py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-black">{row.service}</span>
              <span className="font-display text-lg text-[#1B3745] whitespace-nowrap">
                {row.price}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-black/65">{row.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
