import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic",
    label: "Basic – Polish Only",
    price: "£45",
    bestFor: "Light staining from tea, coffee, or smoking",
    description:
      "A gentle professional polish to remove surface stains and plaque build-up. Ideal for patients who maintain good oral hygiene and simply want fresher breath and a brighter smile. Focuses on smoothness and appearance without deep tartar removal.",
    includes: [
      "Gentle surface stain removal",
      "Plaque build-up polish",
      "Fresher breath & tooth smoothness",
      "Tailored home care tips",
    ],
    highlight: false,
  },
  {
    id: "intermediate",
    label: "Intermediate – Scale Only",
    price: "£65",
    bestFor: "Noticeable tartar build-up or early gum concerns",
    description:
      "A professional scale to remove hardened plaque and tartar from around the teeth and gumline. Improves gum health by removing deposits that cannot be cleaned at home, helping reduce inflammation, bleeding gums, and bad breath.",
    includes: [
      "Hardened plaque & tartar removal",
      "Focused gumline scaling",
      "Reduces bleeding & inflammation",
      "Targeted gum health guidance",
    ],
    highlight: false,
  },
  {
    id: "advanced",
    label: "Advanced – Scale & Polish",
    price: "£75",
    bestFor: "Moderate build-up, inflammation, or a complete refresh",
    description:
      "A comprehensive clean combining full scaling and polishing for optimal oral health and aesthetics. Tartar and plaque are thoroughly removed from above and just below the gumline, followed by polishing to smooth the teeth and enhance shine. Topical anaesthesia can be used for sensitive gums.",
    includes: [
      "Full above & below-gumline scale",
      "Complete stain-removing polish",
      "Topical anaesthesia available",
      "Comprehensive hygiene & gum plan",
    ],
    highlight: true,
  },
];

export function OralHygienePricing() {
  return (
    <section id="pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Our hygiene services
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Three tiers of{" "}
            <span className="text-[#754B3D]">hygiene care</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Transparent pricing for Polish Only, Scale Only, and our complete Scale &amp; Polish
            refresh.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="w-1/4 px-6 py-6 text-xs font-medium uppercase tracking-wider text-black/50">
                    Hygiene tier
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
                  <td className="px-6 py-4 font-medium text-black">Best For</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-6 py-4 text-black/65 ${
                        t.highlight ? "hims-tile-warm font-medium text-[#1B3745]" : ""
                      }`}
                    >
                      {t.bestFor}
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
