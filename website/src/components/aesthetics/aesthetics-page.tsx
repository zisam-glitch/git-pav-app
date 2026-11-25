import { ContactForm } from "@/components/home/contact-form";
import { AestheticsHero } from "./aesthetics-hero";
import { AestheticsPremium } from "./aesthetics-premium";
import { AestheticsPricing } from "./aesthetics-pricing";
import { AestheticsSafety } from "./aesthetics-safety";
import { AestheticsSafetyBanner } from "./aesthetics-safety-banner";
import { AestheticsTestimonials } from "./aesthetics-testimonials";
import { AestheticsTreatments } from "./aesthetics-treatments";
import { AestheticsValues } from "./aesthetics-values";

export function AestheticsPage() {
  return (
    <main className="bg-white">
      <AestheticsHero />
      <AestheticsTreatments />
      <AestheticsPremium />
      <AestheticsValues />
      <AestheticsPricing />
      <AestheticsTestimonials />
      <AestheticsSafetyBanner />
      <AestheticsSafety />
      <ContactForm />
    </main>
  );
}
