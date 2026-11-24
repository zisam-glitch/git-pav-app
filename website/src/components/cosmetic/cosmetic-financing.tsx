import { Section, SectionHead, StepBand } from "@/components/hims";

const CHOOSING_FACTORS = [
  {
    title: "Experience and Qualifications:",
    desc: "Look for a dentist with specialized training and a portfolio of before-and-after cases.",
  },
  {
    title: "Technology:",
    desc: "Opt for a clinic that uses the latest technology for more precise and effective treatments.",
  },
  {
    title: "Reviews and Testimonials:",
    desc: "Customer reviews can provide valuable insights into patient satisfaction and quality of service.",
  },
  {
    title: "Consultation:",
    desc: "A thorough initial consultation is a good sign of a dentist’s professionalism and concern for your needs.",
  },
] as const;

export function CosmeticFinancing() {
  return (
    <Section theme="white" space="sm" aria-labelledby="cosmetic-choose-heading">
      <SectionHead
        id="cosmetic-choose-heading"
        title="How to Choose a General Dentist"
        className="mb-8"
      />
      <StepBand
        items={CHOOSING_FACTORS.map((f) => ({ title: f.title.replace(/:$/, ""), text: f.desc }))}
      />
    </Section>
  );
}
