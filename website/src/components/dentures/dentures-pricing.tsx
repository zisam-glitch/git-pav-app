import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const DENTURE_PLANS = [
  {
    id: "acrylic",
    title: "Acrylic Denture",
    badge: "Classic & adaptable",
    price: "£495",
    description:
      "Traditional full or partial acrylic dentures crafted for reliable function, speech support, and natural tooth shading.",
    points: [
      "Custom shade and tooth shape matching",
      "Full or partial arch designs",
      "Easy to adjust or reline over time",
    ],
    tone: "hims-tile-warm",
    dark: false,
  },
  {
    id: "flexible",
    title: "Flexible (Valplast) Denture",
    badge: "Metal-free comfort",
    price: "£795",
    description:
      "Lightweight flexible nylon resin dentures with discreet gum-toned clasps that blend seamlessly with your natural gums.",
    points: [
      "Invisible gum-coloured clasps",
      "Gentle adaptation to gum contours",
      "No rigid metal components",
    ],
    tone: "hims-navy-gradient",
    dark: true,
  },
  {
    id: "cobalt-chromium",
    title: "Cobalt Chromium Denture",
    badge: "Precision alloy frame",
    price: "£1,195",
    description:
      "Precision-cast cobalt chromium dentures offering an ultra-slim, strong profile that leaves more of your palate uncovered.",
    points: [
      "Ultra-thin high-strength frame",
      "Improved taste and temperature feel",
      "Long-term structural durability",
    ],
    tone: "hims-tile-sage",
    dark: false,
  },
] as const;

export function DenturesPricing() {
  return (
    <section id="pricing" className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Transparent fees
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Our Denture{" "}
            <span className="text-[#754B3D]">Prices</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Affordable denture options designed for comfort and aesthetics. Book a consultation
            with one of our GDC-registered dentists to discuss the right option for your smile.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {DENTURE_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`${plan.tone} flex flex-col justify-between rounded-[1.5rem] border ${
                plan.dark ? "border-[#1B3745] text-white" : "border-black/6 text-black"
              } p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-8`}
            >
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                    plan.dark
                      ? "bg-[#ECD880] text-[#1B3745]"
                      : "bg-black/6 text-black/75"
                  }`}
                >
                  {plan.badge}
                </span>

                <h3
                  className={`mt-5 font-display text-2xl font-normal tracking-[-0.03em] ${
                    plan.dark ? "text-white" : "text-black"
                  }`}
                >
                  {plan.title}
                </h3>

                <p
                  className={`mt-2 font-display text-4xl font-normal tracking-[-0.04em] ${
                    plan.dark ? "text-[#ECD880]" : "text-[#1B3745]"
                  }`}
                >
                  {plan.price}
                </p>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    plan.dark ? "text-white/80" : "text-black/65"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className={`flex items-start gap-2.5 ${
                        plan.dark ? "text-white/90" : "text-black/80"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          plan.dark
                            ? "bg-[#ECD880] text-[#1B3745]"
                            : "bg-black text-white"
                        }`}
                      >
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  variant={plan.dark ? "gold" : "default"}
                  className="w-full"
                >
                  <a href={BOOKING_URL}>
                    Book denture consultation <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs text-black/55">
          NHS Band 3 (£319.10) options and mobile denture visits are also available for eligible
          patients.
        </p>
      </div>
    </section>
  );
}
