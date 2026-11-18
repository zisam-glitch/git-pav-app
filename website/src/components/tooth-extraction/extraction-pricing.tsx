import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const TIERS = [
  {
    id: "simple",
    label: "Simple Extraction",
    price: "£95",
    badge: "Fully erupted teeth",
    description:
      "Removal of teeth that are visible in the mouth and do not require surgical procedures. Straightforward extractions with simple root structures.",
    includes: [
      "Local anaesthetic",
      "Clinical assessment",
      "Post-op instructions",
    ],
    tone: "hims-tile-warm",
    dark: false,
  },
  {
    id: "intermediate",
    label: "Intermediate Extraction",
    price: "£145",
    badge: "Broken at gum line",
    description:
      "More complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth.",
    includes: [
      "Local anaesthetic",
      "Tooth sectioning if needed",
      "Post-op guidance",
    ],
    tone: "bg-white",
    dark: false,
  },
  {
    id: "advanced",
    label: "Advanced Extraction",
    price: "£195",
    badge: "Complex root anatomy",
    description:
      "Difficult extractions due to root shape, tooth position, or limited access. May require sectioning or removing a small amount of surrounding bone.",
    includes: [
      "Digital X-ray assessment",
      "Precision sectioning",
      "Full aftercare support",
    ],
    tone: "hims-tile-sage",
    dark: false,
  },
  {
    id: "surgical",
    label: "Surgical Extraction",
    price: "£295",
    badge: "Impacted teeth",
    description:
      "Surgical procedure for impacted or severely damaged teeth, often requiring gum incision, bone removal, and tooth sectioning for safe removal.",
    includes: [
      "Surgical gum incision & sutures",
      "Bone & root management",
      "Comprehensive follow-up",
    ],
    tone: "hims-navy-gradient",
    dark: true,
  },
] as const;

export function ExtractionPricing() {
  return (
    <section id="pricing" className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Transparent fees
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Our Tooth Extraction{" "}
            <span className="text-[#754B3D]">Prices</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Affordable and transparent pricing assessed before treatment begins — no surprises.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`${tier.tone} flex flex-col justify-between rounded-[1.5rem] border ${
                tier.dark ? "border-[#1B3745] text-white" : "border-black/6 text-black"
              } p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-7`}
            >
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                    tier.dark
                      ? "bg-[#ECD880] text-[#1B3745]"
                      : "bg-black/6 text-black/75"
                  }`}
                >
                  {tier.badge}
                </span>

                <h3
                  className={`mt-4 font-display text-2xl font-normal tracking-[-0.03em] ${
                    tier.dark ? "text-white" : "text-black"
                  }`}
                >
                  {tier.label}
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

        <p className="mt-6 text-xs text-black/55">
          Informed consent for tooth extraction is discussed with your clinician before any
          procedure begins.
        </p>
      </div>
    </section>
  );
}
