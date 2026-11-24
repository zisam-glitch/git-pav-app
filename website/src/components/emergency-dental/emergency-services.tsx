import { Section, DarkQuestion, CallButton } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const EMERGENCY_CONDITIONS = [
  "Toothache",
  "Sensitivity",
  "Broken Filling Tooth",
  "Swelling/Abscess",
  "Denture Ajdustment",
  "Re-cement Crowns",
  "Dental Trauma",
  "Painful Gums",
];

export function EmergencyServices() {
  return (
    <Section id="services" theme="white" space="sm" aria-label="What our emergency dentist treats">
      <DarkQuestion
        lead="Our Emergency Dentist Can Help With"
        highlight="The Following"
        text="Whether it is a chipped tooth, a loose filling, or bad toothache, we will help so you can quickly get back to your normal self again"
        chips={EMERGENCY_CONDITIONS}
        cta={<CallButton variant="gold">Call us Now · {PRACTICE_PHONE}</CallButton>}
      />
    </Section>
  );
}
