import { BookButton, CallButton, CtaBand } from "@/components/hims";
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
    <main className="bg-bg">
      <AestheticsHero />
      <AestheticsTreatments />
      <AestheticsPremium />
      <AestheticsValues />
      <AestheticsPricing />
      <AestheticsTestimonials />
      <AestheticsSafetyBanner />
      <AestheticsSafety />
      <CtaBand
        theme="brown"
        title="Book"
        accent="Appointment"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>
    </main>
  );
}
