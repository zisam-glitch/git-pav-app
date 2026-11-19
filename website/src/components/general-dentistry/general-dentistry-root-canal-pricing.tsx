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
] as const;

export function GeneralDentistryRootCanalPricing() {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-h4 text-fg">Our Root Canal Prices</h3>
      </div>

      <div className="divide-y divide-border">
        {ROOT_CANAL.map((row) => (
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
