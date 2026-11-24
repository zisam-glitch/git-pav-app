import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { HOME_TESTIMONIALS } from "@/content/testimonials";
import { BookButton, CallButton, FloatingCta } from "@/components/hims";
import { EmergencyBanner } from "./emergency-banner";
import { EmergencyContactForm } from "./emergency-contact-form";
import { EmergencyContactStrip } from "./emergency-contact-strip";
import { EmergencyFaq } from "./emergency-faq";
import { EmergencyIntro } from "./emergency-intro";
import { EmergencyHero } from "./emergency-hero";
import { EmergencyPricing } from "./emergency-pricing";
import { EmergencyServices } from "./emergency-services";

export function EmergencyDentalPage() {
  return (
    <main>
      <EmergencyHero />
      <EmergencyIntro />
      <EmergencyPricing />
      <EmergencyServices />
      <EmergencyFaq />
      <EmergencyBanner />
      <TestimonialsSection testimonials={HOME_TESTIMONIALS} />
      <EmergencyContactStrip />
      <EmergencyContactForm />
      <FloatingCta>
        <div className="flex gap-1.5">
          <CallButton variant="default">Call us Now</CallButton>
          <BookButton variant="light">Book Online</BookButton>
        </div>
      </FloatingCta>
    </main>
  );
}
