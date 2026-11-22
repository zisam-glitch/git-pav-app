import { Heart, Smile, Sparkles, SlidersHorizontal, Timer } from "lucide-react";
import { Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { TitleCards } from "@/components/hims/title-cards";

const BENEFITS = [
  {
    title: "1. Enhanced Appearance:",
    body: "The most obvious benefit is a more attractive smile.",
    icon: Sparkles,
  },
  {
    title: "2. Boosted Confidence:",
    body: "A better smile often leads to increased self-esteem and confidence.",
    icon: Smile,
  },
  {
    title: "3. Improved Oral Health:",
    body: "Some procedures can help improve your oral health by making cleaning easier.",
    icon: Heart,
  },
  {
    title: "4. Long-Lasting Results:",
    body: "Many cosmetic dentistry procedures offer long-term or permanent solutions.",
    icon: Timer,
  },
  {
    title: "5. Wider Range of Options:",
    body: "There are treatments available for almost every aesthetic issue you might have with your teeth.",
    icon: SlidersHorizontal,
  },
] as const;

export function CosmeticBenefits() {
  return (
    <Section theme="cream">
      <SectionHeader title="Benefits of" accent="Cosmetic Dentistry" />
      <TitleCards items={BENEFITS} columns={3} className="mt-10 md:mt-14" />
    </Section>
  );
}
