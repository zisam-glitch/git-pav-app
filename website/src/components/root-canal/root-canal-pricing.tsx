import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "basic",
    title: "Basic Root Canal",
    price: "£195",
    toothType: "Incisors & Canines",
    canals: "Single Root",
    description:
      "Root canal treatments on teeth with a single root, such as front teeth (incisors and canines). Straightforward root canal system.",
    includes: [
      "Local anaesthesia",
      "Diagnostic digital X-ray",
      "Single-canal cleaning & seal",
    ],
    tone: "hims-tile-warm",
    dark: false,
  },
  {
    id: "intermediate",
    title: "Intermediate Root Canal",
    price: "£295",
    toothType: "Premolars",
    canals: "Two Roots",
    description:
      "For root canal treatments on premolars or teeth with two roots, addressing multiple roots and more intricate root canal systems.",
    includes: [
      "Local anaesthesia",
      "Multi-canal shaping & disinfection",
      "Biocompatible root canal seal",
    ],
    tone: "hims-navy-gradient",
    dark: true,
  },
  {
    id: "advanced",
    title: "Advanced Root Canal",
    price: "£395",
    toothType: "Molars",
    canals: "Multiple Roots",
    description:
      "For the most complex root canal treatments, typically involving molars with multiple roots and a more complex root canal system.",
    includes: [
      "Advanced endodontic equipment",
      "Complex multi-canal debridement",
      "Crown restoration guidance",
    ],
    tone: "hims-tile-sage",
    dark: false,
  },
] as const;

export function RootCanalPricing() {
  return (
    <section id="pricing" className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Transparent fees
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Our Root Canal{" "}
            <span className="text-[#754B3D]">Prices</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Clear upfront pricing based on tooth type and canal complexity.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`${tier.tone} flex flex-col justify-between rounded-[1.5rem] border ${
                tier.dark ? "border-[#1B3745] text-white" : "border-black/6 text-black"
              } p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-8`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                      tier.dark
                        ? "bg-[#ECD880] text-[#1B3745]"
                        : "bg-black/6 text-black/75"
                    }`}
                  >
                    {tier.toothType}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      tier.dark ? "text-white/75" : "text-black/55"
                    }`}
                  >
                    {tier.canals}
                  </span>
                </div>

                <h3
                  className={`mt-5 font-display text-2xl font-normal tracking-[-0.03em] ${
                    tier.dark ? "text-white" : "text-black"
                  }`}
                >
                  {tier.title}
                </h3>

                <p
                  className={`mt-2 font-display text-4xl font-normal tracking-[-0.04em] ${
                    tier.dark ? "text-[#ECD880]" : "text-[#1B3745]"
                  }`}
                >
                  {tier.price}
                </p>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    tier.dark ? "text-white/80" : "text-black/65"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className={`flex items-start gap-2.5 ${
                        tier.dark ? "text-white/90" : "text-black/80"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          tier.dark
                            ? "bg-[#ECD880] text-[#1B3745]"
                            : "bg-black text-white"
                        }`}
                      >
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  variant={tier.dark ? "gold" : "default"}
                  className="w-full"
                >
                  <a href={BOOKING_URL}>
                    Book appointment <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
