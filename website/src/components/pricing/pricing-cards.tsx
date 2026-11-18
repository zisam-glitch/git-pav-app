import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Heading, Section, Tile, type TileTone } from "@/components/hims";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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

const PLAN_TONE: Record<Plan["color"], TileTone> = {
  bronze: "cream",
  silver: "sage",
  gold: "cream",
};

export function PricingCards() {
  const [isMonthly, setIsMonthly] = useState(true);

  const { data } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: () => api.pricing.get(),
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
    <Section id="plans" theme="white" space="default" aria-labelledby="plans-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading as="h2" size="h2-md" accent="Plans" tone="terracotta" inline className="text-fg">
            <span id="plans-heading">Pav Dental</span>
          </Heading>
          <p className="mt-3 text-lead text-muted">
            Membership tiers for regular check-ups, hygiene visits, and treatment savings.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-pill bg-cream px-4 py-2">
          <span className={cn("text-small font-medium", isMonthly ? "text-fg" : "text-muted")}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!isMonthly}
            aria-label="Toggle annual billing"
            onClick={() => setIsMonthly((v) => !v)}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border-2 border-border-strong t-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !isMonthly ? "bg-black" : "bg-white",
            )}
          >
            <span
              className={cn(
                "pointer-events-none block size-5 rounded-full transition-transform duration-200",
                !isMonthly ? "translate-x-[22px] bg-white" : "translate-x-[2px] bg-black",
              )}
            />
          </button>
          <span className={cn("text-small font-medium", !isMonthly ? "text-fg" : "text-muted")}>
            Annual (Save 20%)
          </span>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {activePlans.map((plan) => {
          const displayPrice = isMonthly ? plan.price : plan.yearlyPrice;
          return (
            <Tile
              key={plan.name}
              as="article"
              tone={PLAN_TONE[plan.color]}
              lift
              className={cn(
                "flex h-full flex-col justify-between gap-8 p-6 md:p-8",
                plan.popular && "border border-border",
              )}
            >
              <div>
                <h3 className="text-label text-muted">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-1.5 text-h3 text-fg tabular-nums">
                  <span>£{displayPrice}</span>
                  <span className="text-small text-muted">/ month</span>
                </p>

                <ul className="mt-6 space-y-3 border-t border-border pt-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-body">
                      {feature.included ? (
                        <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-fg" />
                      ) : (
                        <X aria-hidden="true" className="mt-1 size-4 shrink-0 text-subtle" />
                      )}
                      <span className={feature.included ? "text-fg" : "text-muted"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <BookButton variant={plan.popular ? "default" : "outline"} className="w-full">
                Book Now
              </BookButton>
            </Tile>
          );
        })}
      </div>
    </Section>
  );
}
