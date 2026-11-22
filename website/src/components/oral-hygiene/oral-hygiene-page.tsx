import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { ContactForm } from "@/components/home/contact-form";
import { OralHygieneConsent } from "./oral-hygiene-consent";
import { OralHygieneFaq } from "./oral-hygiene-faq";
import { OralHygieneHero } from "./oral-hygiene-hero";
import { OralHygieneImportance } from "./oral-hygiene-importance";
import { OralHygienePricing } from "./oral-hygiene-pricing";
import { OralHygieneShowcase } from "./oral-hygiene-showcase";
import { OralHygieneWhoNeeds } from "./oral-hygiene-who-needs";

export function OralHygienePage() {
  return (
    <main>
      <OralHygieneHero />
      <OralHygieneImportance />
      <OralHygienePricing />
      <OralHygieneShowcase />
      <OralHygieneWhoNeeds />
      <OralHygieneConsent />
      <OralHygieneFaq />
      <ContactForm />
      <ClosingBand
        title="Ready for healthier gums"
        highlight="and a cleaner smile?"
        lead="786 Leeds Road, Bradford, BD3 9TY · Gentle scale and polish appointments from £45."
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
