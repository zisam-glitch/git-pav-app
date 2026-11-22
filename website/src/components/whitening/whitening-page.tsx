import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { ConsentPanel, type ConsentItem } from "@/components/hims";
import { WhiteningComparison } from "./whitening-comparison";
import { WhiteningContact } from "./whitening-contact";
import { WhiteningFaq } from "./whitening-faq";
import { WhiteningHero } from "./whitening-hero";
import { WhiteningProducts } from "./whitening-products";
import { WhiteningVisualizer } from "./whitening-visualizer";

const WHITENING_CONSENT_ITEMS: readonly ConsentItem[] = [
  {
    title: "Suitability & Prescribing Dentist Review",
    desc: "It is advised that children under the age of 16 (18 in the European Union due to this being a legal requirement), pregnant women, and those sensitive to hydrogen peroxide should not use whitening strips. Patients with teeth sensitive to cold, heat or acid, or those who suffer from oral ulceration should discuss this with their prescribing dentist before undergoing a course of whitening treatment.",
    icon: FileText,
  },
  {
    title: "Temporary Sensitivity & Gum Contact",
    desc: "It is not uncommon to experience tooth sensitivity and / or gum irritation whilst whitening your teeth. Contact with gums should be minimised to avoid gum irritation, and if problems persist, discontinue use and consult your dentist.",
    icon: AlertCircle,
  },
  {
    title: "Temporary White Spots",
    desc: "Temporary white spots may appear after whitening; they are not harmful and will disappear within 24 hours.",
    icon: CheckCircle2,
  },
];

export function WhiteningPage() {
  return (
    <main>
      <WhiteningHero />
      <WhiteningProducts />
      <WhiteningVisualizer />
      <WhiteningComparison />

      <ConsentPanel
        id="consent"
        theme="cream"
        title="Informed Consent for"
        accent="Tooth Whitening"
        intro="Before starting a course of teeth whitening, please review the clinical guidance and suitability considerations with your prescribing dentist."
        items={WHITENING_CONSENT_ITEMS}
      />

      <WhiteningFaq />
      <WhiteningContact />
    </main>
  );
}
