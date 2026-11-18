import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic-root-canal",
    label: "Basic Root Canal",
    price: "£195",
    category: "Single Root",
    description:
      "This category typically includes root canal treatments on teeth with a single root, such as front teeth (incisors and canines). These teeth usually have a straightforward root canal system, which makes the treatment less complicated and time-consuming.",
    includes: [
      "Front teeth treatment",
      "Single root canals",
      "Straightforward procedure",
      "Efficient treatment time",
    ],
    highlight: false,
  },
  {
    id: "intermediate-root-canal",
    label: "Intermediate Root Canal",
    price: "£295",
    category: "Two Roots",
    description:
      "This pricing tier is generally for root canal treatments on premolars or teeth with two roots. The procedure in this category may be more complex than a standard root canal due to the presence of multiple roots and potentially more intricate root canal systems.",
    includes: [
      "Premolar treatment",
      "Two root canals",
      "Multiple root systems",
      "Detailed endodontic care",
    ],
    highlight: true,
  },
  {
    id: "advanced-root-canal",
    label: "Advanced Root Canal",
    price: "£395",
    category: "Multiple Roots",
    description:
      "This is for the most complex root canal treatments, typically involving molars, which have multiple roots and a more complex root canal system. These procedures are often more time-consuming and require advanced techniques and equipment, justifying the higher price.",
    includes: [
      "Molar treatment",
      "Multiple root canals",
      "Advanced techniques",
      "Specialized equipment",
    ],
    highlight: false,
  },
];

export function GeneralDentistryRootCanalPricingTable() {
  return (
    <section id="pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Endodontic pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Our root canal{" "}
            <span className="text-[#754B3D]">prices</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Save your natural tooth with structured root canal pricing for single-root, premolar,
            and molar teeth.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="w-1/4 px-6 py-6 text-xs font-medium uppercase tracking-wider text-black/50">
                    Treatment
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.id}
                      className={`w-1/4 px-6 py-6 ${t.highlight ? "hims-tile-warm" : ""}`}
                    >
                      <div className="text-xs font-medium text-black/60">{t.label}</div>
                      <div
                        className={`mt-1 font-display text-2xl font-normal tracking-[-0.03em] ${
                          t.highlight ? "text-[#754B3D]" : "text-black"
                        }`}
                      >
                        {t.price}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8 text-black/80">
                <tr>
                  <td className="px-6 py-4 font-medium text-black">Category</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-6 py-4 text-black/65 ${
                        t.highlight ? "hims-tile-warm font-medium text-[#1B3745]" : ""
                      }`}
                    >
                      {t.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-black">Description</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-6 py-4 text-xs leading-relaxed text-black/65 ${
                        t.highlight ? "hims-tile-warm" : ""
                      }`}
                    >
                      {t.description}
                    </td>
                  ))}
                </tr>
                {[0, 1, 2, 3].map((idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-medium text-black">
                      {idx === 0 ? "Includes" : ""}
                    </td>
                    {TIERS.map((t) => (
                      <td
                        key={t.id}
                        className={`px-6 py-4 ${t.highlight ? "hims-tile-warm" : ""}`}
                      >
                        <span className="flex items-center gap-2.5 text-sm text-black/85">
                          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-black text-white">
                            <Check className="size-2.5" />
                          </span>
                          {t.includes[idx]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-5 font-medium text-black">Action</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-6 py-5 ${t.highlight ? "hims-tile-warm" : ""}`}
                    >
                      <Button
                        asChild
                        variant={t.highlight ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        <a href={BOOKING_URL}>
                          Book Appointment
                          <ArrowRight className="size-3.5" />
                        </a>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
