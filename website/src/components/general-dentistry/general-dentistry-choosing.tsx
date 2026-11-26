import { Section, SectionHead, StepBand } from "@/components/hims";

const CHOOSING_FACTORS = [
  {
    title: "Qualifications",
    desc: "Make sure the dentist is board-certified and has good reviews.",
  },
  {
    title: "Location",
    desc: "A conveniently located clinic will make regular visits easier.",
  },
  {
    title: "Services Offered",
    desc: "Ensure that the dental office offers the range of services you and your family may need.",
  },
  {
    title: "Insurance",
    desc: "Check if the dental practice accepts your insurance.",
  },
] as const;

export function GeneralDentistryChoosing() {
  return (
    <Section id="choosing" theme="white" space="sm" aria-labelledby="gd-choosing-heading">
      <SectionHead
        id="gd-choosing-heading"
        title="How to Choose a General Dentist"
        className="mb-8"
      />
      <StepBand items={CHOOSING_FACTORS.map((f) => ({ title: f.title, text: f.desc }))} />
    </Section>
  );
}
