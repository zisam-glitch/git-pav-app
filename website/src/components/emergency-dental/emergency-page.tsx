import { ContactForm } from "@/components/home/contact-form";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { EMERGENCY_TESTIMONIALS } from "@/content/testimonials";
import { CallButton, FloatingCta } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";
import { EmergencyBanner } from "./emergency-banner";
import { EmergencyFaq } from "./emergency-faq";
import { EmergencyHero } from "./emergency-hero";
import { EmergencyPricing } from "./emergency-pricing";
import { EmergencyServices } from "./emergency-services";

export function EmergencyDentalPage() {
  return (
    <main className="bg-white">
      <EmergencyHero />
      <EmergencyPricing />
      <EmergencyServices />
      <EmergencyFaq />
      <EmergencyBanner />
      <TestimonialsSection testimonials={EMERGENCY_TESTIMONIALS} />
      <ContactForm />
      <FloatingCta>
        <CallButton>Call us Now · {PRACTICE_PHONE}</CallButton>
      </FloatingCta>
    </main>
  );
}
