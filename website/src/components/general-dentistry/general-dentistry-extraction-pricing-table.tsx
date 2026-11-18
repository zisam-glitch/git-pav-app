import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "simple-extraction",
    label: "Simple Extraction",
    price: "£95",
    category: "Visible Teeth",
    description:
      "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
    includes: [
      "Fully erupted teeth",
      "Simple root structures",
      "Non-surgical procedure",
      "Clear aftercare plan",
    ],
    highlight: false,
  },
  {
    id: "intermediate-extraction",
    label: "Intermediate Extraction",
    price: "£145",
    category: "Complex Cases",
    description:
      "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
    includes: [
      "Broken at gum line",
      "Partially erupted teeth",
      "Tooth sectioning",
      "Bone removal if needed",
    ],
    highlight: true,
  },
  {
    id: "complex-extraction",
    label: "Complex Extraction",
    price: "£195",
    category: "Surgical",
    description:
      "Complex extractions involve surgical procedures, such as removing impacted teeth or those with complicated root structures. They typically require incisions, bone removal, and sometimes sectioning the tooth into multiple parts for easier removal.",
    includes: [
      "Impacted teeth",
      "Complicated roots",
      "Surgical incisions",
      "Guided surgical removal",
    ],
    highlight: false,
  },
];

export function GeneralDentistryExtractionPricingTable() {
  return (
    <section id="extraction-pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Oral surgery pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Our tooth extraction{" "}
            <span className="text-[#754B3D]">prices</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Calm, carefully planned tooth removal from straightforward visible teeth to surgical
            extractions.
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
