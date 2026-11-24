import { ChevronRight, CreditCard, ShoppingBag, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "cart", label: "Bag", icon: ShoppingBag },
  { id: "details", label: "Delivery", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
] as const;

/** The Hims cart stepper: three line icons joined by chevrons, the current one in black. */
export function CheckoutSteps({ current }: { current: (typeof STEPS)[number]["id"] }) {
  return (
    <ol aria-label="Checkout steps" className="flex items-center justify-center gap-3 text-[14px]">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const active = step.id === current;
        return (
          <li key={step.id} className="flex items-center gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center gap-2", active ? "text-[#1b1b1b]" : "text-[#9a9a9e]")}
            >
              <Icon aria-hidden strokeWidth={1.4} className="size-6" />
              <span className="hidden sm:inline">{step.label}</span>
            </span>
            {i < STEPS.length - 1 ? (
              <ChevronRight aria-hidden className="size-4 text-[#bdb8ad]" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
