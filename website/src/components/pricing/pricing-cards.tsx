import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import {
  BookButton,
  ButtonLink,
  Heading,
  Section,
  Tile,
  type TileTone,
} from "@/components/hims";
import { api, HAS_API_BASE } from "@/lib/api";
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
  bronze: "white",
  silver: "sage",
  gold: "white",
};

/** Hims spec-card membership comparison (Mobbin fceeec4f). */
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
    <Section id="plans" theme="cream" space="default" aria-labelledby="plans-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            Monthly &amp; Annual Care
          </span>
          <Heading
            as="h2"
            size="h2-md"
            accent="Plans"
            tone="terracotta"
            inline
            className="mt-4 text-fg"
          >
            <span id="plans-heading">Pav Dental</span>
          </Heading>
          <p className="mt-3 text-lead text-muted">
            Membership tiers for regular check-ups, hygiene visits, and treatment savings.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-pill border border-border bg-white px-4 py-2.5 shadow-soft">
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
              !isMonthly ? "bg-black" : "bg-cream",
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
                plan.popular ? "border border-black/20 shadow-soft" : "border border-border",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-label tracking-wide text-muted">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-pill bg-black px-3 py-1 text-caption font-medium text-white">
                      Most Popular
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 flex items-baseline gap-1.5 text-h3 text-fg tabular-nums">
                  <span>£{displayPrice}</span>
                  <span className="text-small text-muted">/ month</span>
                </p>

                <ul className="mt-6 space-y-3 border-t border-border pt-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-body">
                      {feature.included ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill",
                            plan.popular ? "bg-black text-white" : "bg-sand text-fg",
                          )}
                        >
                          <Check className="size-3" />
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-cream text-subtle"
                        >
                          <X className="size-3" />
                        </span>
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

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-white px-6 py-5 sm:flex-row sm:items-center">
        <p className="text-small text-muted">
          Prefer to pay per visit or review our written treatment plans before committing?
        </p>
        <ButtonLink href="/services/finance" variant="outline" size="sm" className="shrink-0">
          Explore Payment Options
        </ButtonLink>
      </div>
    </Section>
  );
}
