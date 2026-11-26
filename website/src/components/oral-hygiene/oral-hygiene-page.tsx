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
      <OralHygienePricing />
      <OralHygieneImportance />
      <OralHygieneWhoNeeds />
      <OralHygieneShowcase />
      <OralHygieneConsent />
      <OralHygieneFaq />
      <ContactForm />
    </main>
  );
}
