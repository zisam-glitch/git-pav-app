import { OralHygieneHero } from "./oral-hygiene-hero";
import { OralHygieneImportance } from "./oral-hygiene-importance";
import { OralHygieneWhoNeeds } from "./oral-hygiene-who-needs";
import { OralHygienePricing } from "./oral-hygiene-pricing";
import { OralHygieneShowcase } from "./oral-hygiene-showcase";
import { OralHygieneFaq } from "./oral-hygiene-faq";
import { OralHygieneConsent } from "./oral-hygiene-consent";

export function OralHygienePage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <OralHygieneHero />
      <OralHygieneImportance />
      <OralHygienePricing />
      <OralHygieneShowcase />
      <OralHygieneWhoNeeds />
      <OralHygieneConsent />
      <OralHygieneFaq />
    </main>
  );
}
