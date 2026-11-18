const EXTRACTIONS = [
  {
    service: "Simple Extraction",
    price: "£95",
    desc: "Removal of visible teeth that are fully erupted with simple root structures and do not require surgery.",
  },
  {
    service: "Intermediate Extraction",
    price: "£145",
    desc: "Removing teeth broken at the gum line or partially erupted wisdom teeth that may require sectioning.",
  },
  {
    service: "Complex Extraction",
    price: "£195",
    desc: "Surgical removal of impacted teeth or complicated root structures requiring incisions or bone removal.",
  },
];

export function GeneralDentistryExtractionPricing() {
  return (
    <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="border-b border-black/8 pb-4">
        <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
          Tooth Extraction
        </h3>
        <p className="mt-1 text-xs font-medium text-[#754B3D]">Safe tooth removal</p>
      </div>

      <div className="divide-y divide-black/8">
        {EXTRACTIONS.map((row) => (
          <div key={row.service} className="py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-black">{row.service}</span>
              <span className="font-display text-lg text-[#754B3D] whitespace-nowrap">
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
