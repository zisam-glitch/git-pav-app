import { DenturesHero } from "./dentures-hero";
import { DenturesSolutions } from "./dentures-solutions";
import { DenturesPricing } from "./dentures-pricing";
import { DenturesShowcase } from "./dentures-showcase";
import { DenturesFaq } from "./dentures-faq";

export function DenturesPage() {
  return (
    <main className="bg-[#FBF8F5]">
      <DenturesHero />
      <DenturesSolutions />
      <DenturesPricing />
      <DenturesShowcase />
      <DenturesFaq />
    </main>
  );
}
