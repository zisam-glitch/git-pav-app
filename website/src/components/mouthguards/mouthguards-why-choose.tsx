import { BookButton, CheckRows, Section } from "@/components/hims";

const BENEFITS = [
  "Strong protection for sports",
  "Comfortable fit that stays secure",
  "Digital or mould kit options",
  "NHS partners",
  "High quality materials",
  "Fast turnaround",
  "Trusted Bradford based clinic",
] as const;

export function MouthguardsWhyChoose() {
  return (
    <Section theme="white" aria-labelledby="mouthguards-why-choose-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="mouthguards-why-choose-heading"
          className="text-[clamp(34px,4vw,52px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          Why Choose <span className="text-[#8a4242]">Pav Dental Mouthguards?</span>
        </h2>
      </div>
      <div className="mt-10">
        <CheckRows items={BENEFITS.map((b) => ({ title: b }))} />
      </div>
      <div className="mt-8 text-center">
        <BookButton>Make an Appointment</BookButton>
      </div>
    </Section>
  );
}
