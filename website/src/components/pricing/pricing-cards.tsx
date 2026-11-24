import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { BookButton, ButtonLink } from "@/components/hims";
import { api, HAS_API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LEAD, MUTED_TITLE, SOFT_CARD, TITLE, CONTAINER } from "./tokens";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  yearlyPrice: string;
  color: "bronze" | "silver" | "gold";
  popular?: boolean;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    name: "BRONZE",
    price: "9.47",
    yearlyPrice: "7.58",
    color: "bronze",
    features: [
      { text: "1x artificial intelligence dental health scan", included: false },
      { text: "Dedicated Whatsapp Number,", included: false },
      { text: "Appointments in 72hrs", included: true },
      { text: "1x hygiene treatments", included: true },
      { text: "10% off treatment", included: true },
      { text: "10% off Products", included: true },
      { text: "Xrays included", included: true },
      { text: "1x check-up", included: true },
    ],
  },
  {
    name: "SILVER",
    price: "15.85",
    yearlyPrice: "12.68",
    color: "silver",
    popular: true,
    features: [
      { text: "1x artificial intelligence dental health scan", included: false },
      { text: "Dedicated Whatsapp Number,", included: false },
      { text: "Appointments in 48hrs", included: true },
      { text: "2x hygiene treatments", included: true },
      { text: "15% off treatment", included: true },
      { text: "15% off Products", included: true },
      { text: "Xrays included", included: true },
      { text: "2x check-up", included: true },
    ],
  },
  {
    name: "GOLD",
    price: "19.24",
    yearlyPrice: "15.39",
    color: "gold",
    features: [
      { text: "1x artificial intelligence dental health scan", included: true },
      { text: "Dedicated Whatsapp Number,", included: true },
      { text: "Appointments in 24hrs", included: true },
      { text: "3x hygiene visits per yer", included: true },
      { text: "20% off treatment", included: true },
      { text: "20% off Products", included: true },
      { text: "Xrays included", included: true },
      { text: "2x check-up", included: true },
    ],
  },
];

const TIER_DOT: Record<Plan["color"], string> = {
  bronze: "#c0875a",
  silver: "#aeb0b5",
  gold: "#d9a93e",
};

/** Membership plans: Hims soft cards, with the popular plan as a dark card (Sana pricing). */
export function PricingCards() {
  const [isMonthly, setIsMonthly] = useState(true);

  const { data } = useQuery({
    queryKey: ["pricing"],
    queryFn: () => api.pricing.get(),
    enabled: HAS_API_BASE,
    retry: false,
  });

  const activePlans: Plan[] =
    data?.plans && data.plans.length > 0
      ? data.plans.map((p) => ({
          name: p.name,
          price: parseFloat(p.monthly_price as unknown as string).toFixed(2),
          yearlyPrice: parseFloat(p.yearly_price as unknown as string).toFixed(2),
          color: (p.color as Plan["color"]) || "bronze",
          popular: p.is_popular,
          features: p.features || [],
        }))
      : PLANS;

  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24"
    >
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className={TITLE} id="plans-heading">
              Pav Dental <span className={MUTED_TITLE}>Plans</span>
            </h2>
            <p className={`mt-4 max-w-[34rem] ${LEAD}`}>
              Membership tiers for regular check-ups, hygiene visits, and treatment savings.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-[0_10px_36px_rgba(20,20,40,0.07)]">
            <span
              className={cn(
                "text-small font-medium",
                isMonthly ? "text-[#1b1b1b]" : "text-[#8b8d92]",
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!isMonthly}
              aria-label="Toggle annual billing"
              onClick={() => setIsMonthly((v) => !v)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full t-colors focus-visible:ring-2 focus-visible:ring-[#5b3fc4] focus-visible:ring-offset-2 focus-visible:outline-none",
                !isMonthly ? "bg-[#5b3fc4]" : "bg-[#d9d6cf]",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block size-5 rounded-full bg-white shadow transition-transform duration-200",
                  !isMonthly ? "translate-x-[24px]" : "translate-x-[4px]",
                )}
              />
            </button>
            <span
              className={cn(
                "text-small font-medium",
                !isMonthly ? "text-[#1b1b1b]" : "text-[#8b8d92]",
              )}
            >
              Annual (Save 20%)
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-3 lg:gap-4">
          {activePlans.map((plan) => {
            const displayPrice = isMonthly ? plan.price : plan.yearlyPrice;
            const dark = Boolean(plan.popular);
            return (
              <article
                key={plan.name}
                className={cn(
                  "flex h-full flex-col justify-between gap-8 p-7 md:p-9",
                  dark ? "rounded-[22px] bg-[#1b1b1b] text-white" : SOFT_CARD,
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2.5 text-[15px] tracking-[0.12em]">
                      <span
                        aria-hidden
                        className="size-3.5 rounded-full"
                        style={{ backgroundColor: TIER_DOT[plan.color] ?? TIER_DOT.bronze }}
                      />
                      {plan.name}
                    </h3>
                    {plan.popular ? (
                      <span className="rounded-full bg-white px-3 py-1 text-caption font-medium text-[#1b1b1b]">
                        Most Popular
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-6 flex items-baseline gap-2 tabular-nums">
                    <span className="text-[clamp(44px,4.2vw,64px)] leading-none font-normal tracking-[-0.03em]">
                      £{displayPrice}
                    </span>
                    <span className={cn("text-small", dark ? "text-white/70" : "text-[#55565a]")}>
                      / month
                    </span>
                  </p>

                  <ul
                    className={cn(
                      "mt-8 space-y-3.5 border-t pt-7",
                      dark ? "border-white/15" : "border-[#1b1b1b]/10",
                    )}
                  >
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-[16px] leading-snug">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                            feature.included
                              ? dark
                                ? "bg-white text-[#1b1b1b]"
                                : "bg-[#5b3fc4] text-white"
                              : dark
                                ? "bg-white/10 text-white/50"
                                : "bg-[#efece6] text-[#8b8d92]",
                          )}
                        >
                          {feature.included ? (
                            <Check className="size-3" />
                          ) : (
                            <X className="size-3" />
                          )}
                        </span>
                        <span
                          className={cn(
                            feature.included
                              ? dark
                                ? "text-white"
                                : "text-[#1b1b1b]"
                              : dark
                                ? "text-white/50"
                                : "text-[#8b8d92]",
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <BookButton variant={dark ? "gold" : "outline"} className="w-full">
                  Book Now
                </BookButton>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[22px] bg-white px-6 py-5 shadow-[0_10px_36px_rgba(20,20,40,0.07)] sm:flex-row sm:items-center">
          <p className="text-small text-[#55565a]">
            Prefer to pay per visit or review our written treatment plans before committing?
          </p>
          <ButtonLink href="/services/finance" variant="outline" size="sm" className="shrink-0">
            Explore Payment Options
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
