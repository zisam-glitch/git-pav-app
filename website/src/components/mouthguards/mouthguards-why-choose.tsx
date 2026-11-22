import { BookButton, CallButton, Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { TitleCards } from "@/components/hims/title-cards";

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
    <Section theme="brown" space="lg">
      <SectionHeader
        title="Why Choose"
        accent="Pav Dental Mouthguards?"
        tone="gold"
        action={
          <>
            <BookButton variant="gold">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
      <TitleCards
        tone="dark"
        columns={4}
        className="mt-10 md:mt-14"
        items={BENEFITS.map((title) => ({ title }))}
      />
    </Section>
  );
}
