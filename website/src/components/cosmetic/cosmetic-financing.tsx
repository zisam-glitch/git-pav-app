import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "bonding",
    label: "Dental Bonding",
    price: "From £150",
    monthly: "Flexible payment plans",
    description:
      "Tooth-colored resin applied and light-cured to repair chipped, cracked, or uneven teeth in a single visit.",
    includes: [
      "Minimal enamel alteration",
      "Single-visit completion",
      "Shade matched & polished",
      "Cost-effective smile repair",
    ],
    highlight: false,
  },
  {
    id: "veneers",
    label: "Porcelain Veneers",
    price: "From £595",
    monthly: "Financing options available",
    description:
      "Custom-fitted porcelain shells covering the front surface of a tooth to correct uneven teeth, worn enamel, or discoloration.",
    includes: [
      "Digital smile assessment",
      "Custom-fitted porcelain shells",
      "Stain-resistant finish",
      "Long-lasting aesthetic result",
    ],
    highlight: true,
  },
  {
    id: "implants",
    label: "Dental Implants",
    price: "From £1,850",
    monthly: "Financing options available",
    description:
      "Used to replace missing teeth, offering a long-lasting restorative and aesthetic solution that looks and feels natural.",
    includes: [
      "Clinical & radiological planning",
      "Precision implant placement",
      "Custom ceramic crown",
      "Natural bite restoration",
    ],
    highlight: false,
  },
];

export function CosmeticFinancing() {
  return (
    <section id="financing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Costs &amp; financing
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Transparent fees &amp;{" "}
            <span className="text-[#754B3D]">financing options</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            The cost of cosmetic dentistry varies depending on the procedure and clinical plan.
            While many cosmetic procedures are not covered by dental insurance, financing options
            are available.
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
                  <td className="px-6 py-4 font-medium text-black">Payment Support</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-6 py-4 text-black/65 ${
                        t.highlight ? "hims-tile-warm font-medium text-[#1B3745]" : ""
                      }`}
                    >
                      {t.monthly}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-black">Overview</td>
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
                          Book Consultation
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

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-black/55">
          Written treatment plans and itemized quotes are provided at your initial clinical
          consultation.
        </p>
      </div>
    </section>
  );
}
