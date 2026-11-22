import { Heart, ShieldCheck, UserCheck } from "lucide-react";
import { Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { TitleCards } from "@/components/hims/title-cards";

const VALUES = [
  {
    title: "Wholehearted Commitment",
    body: "Our motivation stems from a genuine desire to provide the best care, rather than being driven by sales incentives.",
    icon: Heart,
  },
  {
    title: "Expert Guidance",
    body: "We take immense pride in delivering expert advice and guidance to our valued clients.",
    icon: UserCheck,
  },
  {
    title: "Quality Assurance",
    body: "Our unwavering commitment lies in using the utmost quality products, with no room for compromise.",
    icon: ShieldCheck,
  },
] as const;

export function AestheticsValues() {
  return (
    <Section theme="white">
      <SectionHeader title="Our" accent="Values" />
      <TitleCards items={VALUES} columns={3} className="mt-10 md:mt-14" />
    </Section>
  );
}
