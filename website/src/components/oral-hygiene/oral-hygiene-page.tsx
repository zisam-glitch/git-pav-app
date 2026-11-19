import { BookButton, CallButton, CtaBand } from "@/components/hims";
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
      <CtaBand
        theme="brown"
        title="Ready for healthier gums"
        accent="and a cleaner smile?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Gentle scale and polish appointments from £45.
      </CtaBand>
    </main>
  );
}
