import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { GeneralDentistryConsentPanel, type ConsentItem } from "./general-dentistry-consent-panel";
import { YOUTUBE } from "@/content/videos";

const CONSENT_ITEMS: readonly ConsentItem[] = [
  {
    title: "Treatment Understanding",
    desc: "I understand the nature of the tooth extraction procedure, including the removal process and expected recovery time.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "I have been informed of the potential risks and benefits, including possible bleeding, infection, and alternatives to extraction.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "I understand that my participation in this treatment is voluntary and I may withdraw consent at any time.",
    icon: CheckCircle2,
  },
];

export function GeneralDentistryExtractionConsent() {
  return (
    <GeneralDentistryConsentPanel
      theme="white"
      title="Informed Consent for"
      accent="Tooth Extraction"
      intro="Before proceeding with tooth extraction, we ensure you fully understand the procedure, risks, and benefits of removing your tooth."
      items={CONSENT_ITEMS}
      video={{ ...YOUTUBE.extraction, title: "Informed consent for tooth extraction" }}
    />
  );
}
