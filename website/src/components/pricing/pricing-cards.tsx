import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  yearlyPrice: string;
  color: "bronze" | "silver" | "gold";
  popular?: boolean;
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

const BANNER_BG: Record<Plan["color"], string> = {
  bronze: "bg-[#c4824d]",
  silver: "bg-[#bdc3c7]",
  gold: "bg-[#f5cf47]",
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
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section title */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#844d1e]">
            Pav Dental Plans
          </h2>

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={cn("text-sm font-medium", isMonthly ? "text-fg" : "text-muted")}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!isMonthly}
              onClick={() => setIsMonthly((v) => !v)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isMonthly ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block size-5 rounded-full bg-white shadow-md transition-transform",
                  !isMonthly ? "translate-x-[22px]" : "translate-x-[2px]",
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", !isMonthly ? "text-fg" : "text-muted")}>
              Annual{" "}
              <span className="text-primary font-semibold">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* 3 cards */}
        <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
          {activePlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              className="h-full"
            >
              <PricingCard plan={plan} isMonthly={isMonthly} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, isMonthly }: { plan: Plan; isMonthly: boolean }) {
  const displayPrice = isMonthly ? plan.price : plan.yearlyPrice;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex flex-col h-full rounded-2xl overflow-hidden bg-white border transition-all duration-300 shadow-sm",
        plan.popular
          ? "border-primary/40 shadow-md ring-1 ring-primary/10"
          : "border-border/80 hover:border-primary/40",
        hovered && "shadow-soft -translate-y-1",
      )}
    >
      {/* Wavy Banner Header */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center pt-10 pb-12 overflow-hidden",
          BANNER_BG[plan.color],
        )}
      >
        {/* Organic wave shape at bottom of banner */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white pointer-events-none"
          viewBox="0 0 500 50"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 C150,55 350,10 500,45 L500,50 L0,50 Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 flex items-baseline justify-center text-white">
          <span className="text-3xl font-bold mr-0.5">£</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight font-display tabular-nums"
            >
              {displayPrice}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Plan Name */}
      <div className="px-6 pt-6 pb-4 text-center">
        <h3 className="text-base font-extrabold tracking-widest text-fg">
          {plan.name}
        </h3>
      </div>

      {/* Features list */}
      <ul className="flex-1 space-y-3 px-6 py-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] sm:text-sm">
            {f.included ? (
              <Check className="size-4 shrink-0 text-green-600 mt-0.5 stroke-[2.5]" />
            ) : (
              <X className="size-4 shrink-0 text-red-500 mt-0.5 stroke-[2.5]" />
            )}
            <span
              className={cn(
                "leading-snug",
                f.included ? "text-fg/90" : "text-muted",
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="p-6 pt-6">
        <Button
          asChild
          variant={plan.popular ? "default" : "outline"}
          className={cn(
            "w-full rounded-lg font-semibold text-sm",
            plan.popular ? "accent-gradient text-white" : "border-border hover:bg-surface",
          )}
        >
          <a href={BOOKING_URL}>Book Now</a>
        </Button>
      </div>
    </div>
  );
}
