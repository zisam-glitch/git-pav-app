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
] as const;

export function GeneralDentistryFillingPricing() {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-h4 text-fg">Our White Filling Prices</h3>
      </div>

      <div className="divide-y divide-border">
        {FILLINGS.map((row) => (
          <div key={row.service} className="py-4 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-label text-fg">{row.service}</span>
              <span className="text-lead font-medium tabular-nums text-fg whitespace-nowrap">
                {row.price}
              </span>
            </div>
            <p className="mt-2 text-small text-muted">{row.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
