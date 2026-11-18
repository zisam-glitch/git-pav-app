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
] as const;

export function GeneralDentistryExtractionPricing() {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-h4 text-fg">Our Tooth Extraction Prices</h3>
      </div>

      <div className="divide-y divide-border">
        {EXTRACTIONS.map((row) => (
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
