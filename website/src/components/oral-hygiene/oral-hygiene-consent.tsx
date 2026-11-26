import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Heading, Section, Tile, YouTubeVideo } from "@/components/hims";
import { YOUTUBE } from "@/content/videos";

const CONSENT_ITEMS = [
  {
    title: "Treatment Understanding",
    desc: "I understand the nature of the dental hygiene treatment, including the procedures to be performed and the expected outcomes.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "I have been informed of the potential risks and benefits of the treatment, including possible side effects and alternatives.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "I understand that my participation in this treatment is voluntary and I may withdraw consent at any time.",
    icon: CheckCircle2,
  },
];

export function OralHygieneConsent() {
  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="max-w-2xl">
        <Heading as="h2" size="hero" accent="Informed Consent" tone="gold" className="mt-4">
          Understanding
        </Heading>
        <p className="mt-4 text-lead text-white/80">
          Before proceeding with any dental hygiene treatment, we ensure you fully understand the
          procedure, risks, and benefits. Your comfort and understanding are our priorities.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {CONSENT_ITEMS.map((item, index) => (
          <Tile
            key={item.title}
            tone="glass"
            className="flex flex-col gap-4 border border-white/12 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white/10 text-gold">
                <item.icon aria-hidden className="size-4" />
              </span>
              <span className="rounded-pill bg-white/10 px-2.5 py-0.5 text-caption font-medium text-gold tabular-nums">
                0{index + 1}
              </span>
            </div>
            <h3 className="border-t border-white/12 pt-4 text-h4 text-white">{item.title}</h3>
            <p className="text-body text-white/80">{item.desc}</p>
          </Tile>
        ))}
      </div>

      <YouTubeVideo {...YOUTUBE.oralHygiene} title="Informed consent for dental hygiene treatment" className="mt-8" />
    </Section>
  );
}
