const FILLINGS = [
  {
    service: "Basic Composite",
    price: "£95",
    desc: "Generally for small composite fillings, typically used for minor tooth decay or small cavities.",
  },
  {
    service: "Intermediate Composite",
    price: "£145",
    desc: "For moderate tooth decay or larger cavities, requiring detailed tooth preparation and careful shaping.",
  },
  {
    service: "Advanced Composite",
    price: "£195",
    desc: "For significant decay or damage covering multiple tooth surfaces or complex anatomy.",
  },
];

export function GeneralDentistryFillingPricing() {
  return (
    <div className="hims-tile-sage rounded-[1.5rem] border border-black/6 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="border-b border-black/8 pb-4">
        <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
          White Fillings
        </h3>
        <p className="mt-1 text-xs font-medium text-[#1B3745]">Natural-looking restoration</p>
      </div>

      <div className="divide-y divide-black/8">
        {FILLINGS.map((row) => (
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
