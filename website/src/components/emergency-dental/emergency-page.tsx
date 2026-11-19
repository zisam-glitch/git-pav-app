import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { HOME_TESTIMONIALS } from "@/content/testimonials";
import { EmergencyBanner } from "./emergency-banner";
import { EmergencyContactForm } from "./emergency-contact-form";
import { EmergencyContactStrip } from "./emergency-contact-strip";
import { EmergencyFaq } from "./emergency-faq";
import { EmergencyHero } from "./emergency-hero";
import { EmergencyPricing } from "./emergency-pricing";
import { EmergencyServices } from "./emergency-services";

export function EmergencyDentalPage() {
  return (
    <main>
      <EmergencyHero />
      <EmergencyPricing />
      <EmergencyServices />
      <EmergencyFaq />
      <EmergencyBanner />
      <TestimonialsSection testimonials={HOME_TESTIMONIALS} />
      <EmergencyContactStrip />
      <EmergencyContactForm />
    </main>
  );
}
