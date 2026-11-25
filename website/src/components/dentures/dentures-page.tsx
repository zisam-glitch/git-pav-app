import { ContactForm } from "@/components/home/contact-form";
import { DenturesFaq } from "./dentures-faq";
import { DenturesHero } from "./dentures-hero";
import { DenturesPricing } from "./dentures-pricing";
import { DenturesShowcase } from "./dentures-showcase";
import { DenturesSolutions } from "./dentures-solutions";

export function DenturesPage() {
  return (
    <main className="bg-white">
      <DenturesHero />
      <DenturesShowcase />
      <DenturesPricing />
      <DenturesSolutions />
      <DenturesFaq />
      <ContactForm />
    </main>
  );
}
