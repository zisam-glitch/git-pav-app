import { Clock, Phone, Sparkles, Stethoscope, Truck } from "lucide-react";
import { Section, TrustStrip, type TrustItem } from "@/components/hims";

const ITEMS: TrustItem[] = [
  {
    icon: <Clock aria-hidden className="size-4 shrink-0" />,
    text: "Open 00:00 – 24:00, 7 days",
    tone: "terracotta",
  },
  {
    icon: <Stethoscope aria-hidden className="size-4 shrink-0" />,
    text: "£35 complete dental check-up",
    tone: "navy",
  },
  {
    icon: <Phone aria-hidden className="size-4 shrink-0" />,
    text: "24/7 emergency dental care",
    tone: "sky",
  },
  {
    icon: <Truck aria-hidden className="size-4 shrink-0" />,
    text: "Mobile dentistry across Bradford",
    tone: "terracotta",
  },
  {
    icon: <Sparkles aria-hidden className="size-4 shrink-0" />,
    text: "Free online appointment booking",
    tone: "copper",
  },
];

export function Marquee() {
  return (
    <Section theme="white" space="sm">
      <TrustStrip items={ITEMS} />
    </Section>
  );
}
