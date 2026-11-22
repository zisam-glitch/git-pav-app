import { Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";

const REASONS = [
  ["Worldwide Reach:", "No matter your location, our grillz are just a scan away."],
  [
    "Expert Craftsmanship:",
    "With attention to detail and quality, we create pieces that are as unique as you.",
  ],
  ["Personalized Experience:", "From design to delivery, your preferences are our priority."],
  ["Peace of Mind:", "Our 1-year guarantee means your investment is protected."],
] as const;

/** Hims key-line rows (see `KeyLineList`), with the title and its sentence in one paragraph as on the live page. */
export function GrillzProcess() {
  return (
    <Section id="why-pav" theme="cream">
      <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-28">
        <SectionHeader title="Why Choose" accent="Pav Dental Grillz?" size="h3" />
        <ul className="space-y-6">
          {REASONS.map(([title, text]) => (
            <li key={title} className="flex gap-5">
              <span
                aria-hidden
                className="mx-1.5 w-2 shrink-0 rounded-[10px] bg-linear-to-b from-terracotta via-clay to-copper"
              />
              <p className="py-0.5">
                <span className="block text-h3-md text-fg">{title}</span>
                <span className="mt-2 block text-body text-muted">{text}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
