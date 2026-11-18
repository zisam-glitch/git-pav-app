import { AestheticsHero } from "./aesthetics-hero";
import { AestheticsTreatments } from "./aesthetics-treatments";
import { AestheticsPremium } from "./aesthetics-premium";
import { AestheticsValues } from "./aesthetics-values";
import { AestheticsPricing } from "./aesthetics-pricing";
import { AestheticsSafetyBanner } from "./aesthetics-safety-banner";
import { AestheticsFaq } from "./aesthetics-faq";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { AESTHETICS_TESTIMONIALS } from "@/content/testimonials";

export function AestheticsPage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <AestheticsHero />
      <AestheticsTreatments />
      <AestheticsPremium />
      <AestheticsValues />
      <AestheticsPricing />
      <TestimonialsSection testimonials={AESTHETICS_TESTIMONIALS} theme="warm" />
      <AestheticsSafetyBanner />
      <AestheticsFaq />
    </main>
  );
}
