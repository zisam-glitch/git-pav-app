import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { GeneralDentistryConsentPanel, type ConsentItem } from "./general-dentistry-consent-panel";

const CONSENT_ITEMS: readonly ConsentItem[] = [
  {
    title: "Treatment Understanding",
    desc: "I understand the nature of the root canal treatment, including the procedure to remove infected pulp and seal the tooth.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "I have been informed of the potential risks and benefits, including possible post-treatment sensitivity and alternatives like extraction.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "I understand that my participation in this treatment is voluntary and I may withdraw consent at any time.",
    icon: CheckCircle2,
  },
];

export function GeneralDentistryRootCanalConsent() {
  return (
    <GeneralDentistryConsentPanel
      theme="cream"
      title="Informed Consent for"
      accent="Root Canal Treatment"
      intro="Before proceeding with root canal treatment, we ensure you fully understand the procedure, risks, and benefits of saving your natural tooth."
      items={CONSENT_ITEMS}
    />
  );
}
