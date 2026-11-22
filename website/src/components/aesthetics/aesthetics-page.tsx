import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
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
    <main>
      <AestheticsHero />
      <AestheticsTreatments />
      <AestheticsPremium />
      <AestheticsValues />
      <AestheticsPricing />
      <AestheticsTestimonials />
      <AestheticsSafetyBanner />
      <AestheticsSafety />
      <ClosingBand
        title="Book"
        highlight="Appointment"
        lead="Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine check-ups, and advanced technologies like digital imaging and laser dentistry."
        actions={
          <>
            <BookButton variant="butter">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
    </main>
  );
}
