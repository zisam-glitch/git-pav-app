import { EmergencyHero } from "./emergency-hero";
import { EmergencyPricing } from "./emergency-pricing";
import { EmergencyServices } from "./emergency-services";
import { EmergencyFaq } from "./emergency-faq";
import { EmergencyBanner } from "./emergency-banner";
import { EmergencyContactStrip } from "./emergency-contact-strip";
import { EmergencyContactForm } from "./emergency-contact-form";

export function EmergencyDentalPage() {
  return (
    <main className="bg-[#fffdf9]">
      <EmergencyHero />
      <EmergencyPricing />
      <EmergencyServices />
      <EmergencyFaq />
      <EmergencyBanner />
      <EmergencyContactStrip />
      <EmergencyContactForm />
    </main>
  );
}
