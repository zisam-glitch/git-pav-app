import { CheckCircle2, Layers, Shield, Sparkles } from "lucide-react";
import { BookButton, Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { TitleCards } from "@/components/hims/title-cards";

const SOLUTIONS = [
  { title: "Full Dentures", icon: Sparkles },
  { title: "Partial Dentures", icon: Layers },
  { title: "Implant-Supported Dentures", icon: Shield },
  { title: "Flexible Dentures", icon: CheckCircle2 },
] as const;

export function DenturesSolutions() {
  return (
    <Section id="solutions" theme="white">
      <SectionHeader
        title="We offer a variety of"
        accent="denture solutions, including:"
        lead="We Are The Dentists That Come To You."
        action={<BookButton variant="outline">Book Consultation</BookButton>}
      />
      <TitleCards items={SOLUTIONS} columns={4} className="mt-10 md:mt-14" />

      <div className="mt-3 rounded-md bg-cream p-6 md:mt-[15px] md:p-10">
        <h3 className="text-h4 text-fg">Affordable Denture Options</h3>
        <p className="mt-3 max-w-3xl text-body text-muted">
          Our team of skilled professionals uses the latest technology to scan, design, and fit
          dentures that look and feel natural. We prioritize both comfort and aesthetics in every
          set we create.
        </p>
      </div>
    </Section>
  );
}
