import { useQuery } from "@tanstack/react-query";
import { BookButton, Heading, Section } from "@/components/hims";
import { Chip } from "@/components/hims/chip";
import { PlanCard } from "@/components/hims/plan-card";
import { api, HAS_API_BASE } from "@/lib/api";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  color: "bronze" | "silver" | "gold";
  popular?: boolean;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    name: "BRONZE",
    price: "9.47",
    color: "bronze",
    features: [
      { text: "1x artificial intelligence dental health scan", included: true },
      { text: "Dedicated Whatsapp Number,", included: true },
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
    color: "silver",
    popular: true,
    features: [
      { text: "1x artificial intelligence dental health scan", included: true },
      { text: "Dedicated Whatsapp Number,", included: true },
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

/** Hims plan cards (membership.md, labs.md): soft grey cards, the featured one white and lifted. */
export function PricingCards() {
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
          color: (p.color as Plan["color"]) || "bronze",
          popular: p.is_popular,
          features: p.features || [],
        }))
      : PLANS;

  return (
    <Section id="plans" theme="white" space="default" aria-labelledby="plans-heading">
      <Heading as="h2" size="h2-md" accent="Plans" tone="terracotta" inline>
        <span id="plans-heading">Pav Dental</span>
      </Heading>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {activePlans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            price={`£${plan.price}`}
            featured={plan.popular}
            badge={plan.popular ? <Chip tone="dark">Most Popular</Chip> : null}
            features={plan.features.map((f) => ({ text: f.text }))}
            action={
              <BookButton variant={plan.popular ? "default" : "outline"}>Book Now</BookButton>
            }
          />
        ))}
      </div>
    </Section>
  );
}
