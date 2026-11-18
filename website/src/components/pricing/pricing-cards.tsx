import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  yearlyPrice: string;
  color: "bronze" | "silver" | "gold";
  features: Feature[];
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
          features: p.features || [],
        }))
      : PLANS;

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
            Pav Dental <span className="text-[#754B3D]">Plans</span>
          </h2>

          {/* Billing Switch */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={cn("text-sm font-medium", isMonthly ? "text-black" : "text-black/50")}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!isMonthly}
              aria-label="Toggle annual billing"
              onClick={() => setIsMonthly((v) => !v)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isMonthly ? "bg-[#1B3745]" : "bg-black/20",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform",
                  !isMonthly ? "translate-x-[22px]" : "translate-x-[2px]",
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", !isMonthly ? "text-black" : "text-black/50")}>
              Annual <span className="font-medium text-[#754B3D]">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {activePlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} isMonthly={isMonthly} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, isMonthly }: { plan: Plan; isMonthly: boolean }) {
  const displayPrice = isMonthly ? plan.price : plan.yearlyPrice;
  const isGold = plan.color === "gold";
  const isSilver = plan.color === "silver";

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] border p-7 transition-all duration-200 hover:-translate-y-0.5 sm:p-8",
        isGold
          ? "hims-navy-gradient border-[#1B3745] text-white shadow-[0_12px_32px_rgba(27,55,69,0.18)]"
          : isSilver
            ? "border-black/8 bg-[#F2EDE5] text-black shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
            : "border-black/6 bg-white text-black shadow-[0_6px_24px_rgba(0,0,0,0.04)]",
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "font-display text-sm font-medium uppercase tracking-wider",
              isGold ? "text-[#ECD880]" : "text-[#754B3D]",
            )}
          >
            {plan.name}
          </h3>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium",
              isGold ? "bg-white/10 text-white/85" : "bg-[#FAF8F2] text-black/60",
            )}
          >
            {isMonthly ? "Per month" : "Monthly (annual)"}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-1">
          <span
            className={cn(
              "font-display text-2xl font-normal",
              isGold ? "text-[#ECD880]" : "text-black",
            )}
          >
            £
          </span>
          <span
            className={cn(
              "font-display text-5xl font-normal tracking-[-0.04em] tabular-nums",
              isGold ? "text-white" : "text-black",
            )}
          >
            {displayPrice}
          </span>
        </div>

        <ul
          className={cn(
            "mt-7 divide-y border-t",
            isGold ? "divide-white/10 border-white/10" : "divide-black/8 border-black/8",
          )}
        >
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span
                className={cn(
                  "leading-snug",
                  isGold
                    ? f.included
                      ? "text-white/90"
                      : "text-white/40"
                    : f.included
                      ? "text-black/85"
                      : "text-black/40",
                )}
              >
                {f.text}
              </span>
              {f.included ? (
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                    isGold ? "bg-[#ECD880] text-[#1B3745]" : "bg-black text-white",
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3 stroke-[2.5]" />
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                    isGold ? "bg-white/10 text-white/40" : "bg-black/6 text-black/35",
                  )}
                  aria-hidden="true"
                >
                  <Minus className="size-3" />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-7">
        <Button
          asChild
          variant={isGold ? "gold" : "default"}
          className="w-full"
        >
          <a href={BOOKING_URL}>Book Now</a>
        </Button>
      </div>
    </div>
  );
}
