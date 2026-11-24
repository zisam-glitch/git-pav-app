import { Clock, Gem, HeartHandshake, MapPin, ScanLine, Shield, Smile } from "lucide-react";
import { BookButton, CallButton, IncludedList, Section, SectionHead } from "@/components/hims";

const BENEFITS = [
  { text: "Strong protection for sports", icon: Shield },
  { text: "Comfortable fit that stays secure", icon: Smile },
  { text: "Digital or mould kit options", icon: ScanLine },
  { text: "NHS partners", icon: HeartHandshake },
  { text: "High quality materials", icon: Gem },
  { text: "Fast turnaround", icon: Clock },
  { text: "Trusted Bradford based clinic", icon: MapPin },
];

export function MouthguardsWhyChoose() {
  return (
    <Section theme="cream" aria-labelledby="mouthguards-why-choose-heading">
      <SectionHead
        id="mouthguards-why-choose-heading"
        title="Pav Dental Mouthguards?"
        accent="Why Choose"
        action={
          <div className="flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <CallButton variant="ghost" />
          </div>
        }
      />
      <IncludedList items={BENEFITS} />
    </Section>
  );
}
