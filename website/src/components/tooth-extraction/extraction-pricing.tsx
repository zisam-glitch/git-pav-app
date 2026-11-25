import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import {
  BeigeGrid,
  BookButton,
  HUB_CARD,
  Section,
  SectionHead,
  type PricingTier,
} from "@/components/hims";

const TIERS: readonly PricingTier[] = [
  {
    id: "simple",
    eyebrow: "Simple Extraction (£95)",
    price: "£95",
    name: "Simple Extraction",
    description:
      "This category typically includes the removal of teeth that are visible in the mouth and do not require surgical procedures. These are straightforward extractions, often involving teeth that are fully erupted and have simple root structures.",
    tone: "cream",
  },
  {
    id: "intermediate",
    eyebrow: "Intermediate Extraction (£145)",
    price: "£145",
    name: "Intermediate Extraction",
    description:
      "This involves more complex procedures than simple extractions, including removing teeth broken at the gum line or partially erupted wisdom teeth. It may require tooth sectioning or removing some overlying bone.",
    tone: "cream",
  },
  {
    id: "advanced",
    eyebrow: "Advanced Extraction (£195)",
    price: "£195",
    name: "Advanced Extraction",
    description:
      "This involves difficult extractions due to root shape, tooth position, or limited access in the mouth. The procedure may require sectioning the tooth or removing a small amount of surrounding bone to allow safe removal.",
    tone: "cream",
  },
  {
    id: "surgical",
    eyebrow: "Surgical Extraction (£295)",
    price: "£295",
    name: "Surgical Extraction",
    description:
      "This involves a surgical procedure for impacted or severely damaged teeth, often requiring gum incision, bone removal, and tooth sectioning to safely extract the tooth.",
    tone: "sage",
  },
];

const CONSENT_POINTS = [
  {
    title: "Treatment Understanding",
    desc: "Your clinician explains the tooth removal process and expected recovery time before treatment.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "We talk through potential bleeding, healing guidance, and restorative alternatives to extraction.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "Your participation is voluntary, with time to ask questions at every stage of your appointment.",
    icon: CheckCircle2,
  },
] as const;

export function ExtractionPricing() {
  return (
    <Section id="pricing" theme="white" aria-labelledby="extraction-pricing-heading">
      <SectionHead
        id="extraction-pricing-heading"
        title="Our Tooth Extraction Prices"
        action={<BookButton>Make an Appointment</BookButton>}
      />
      <div className="mt-10">
        <BeigeGrid
          items={TIERS.map((t) => ({ title: t.name, sub: t.price, text: <p>{t.description}</p> }))}
        />
      </div>
      <div className={`${HUB_CARD} mt-3 p-7 md:p-9`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="mt-3 text-h3-md text-fg">Informed Consent for Tooth Extraction</h3>
            <p className="mt-1 text-body text-muted">
              Your clinician will talk through your procedure, alternatives, and aftercare before
              any treatment begins.
            </p>
          </div>
          <BookButton variant="outline">Book Consultation</BookButton>
        </div>

        <ul className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-3">
          {CONSENT_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li
                key={point.title}
                className="flex items-start gap-3.5 rounded-[16px] bg-white p-4"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-terracotta">
                  <Icon aria-hidden className="size-4" />
                </span>
                <div>
                  <p className="text-label text-fg">{point.title}</p>
                  <p className="mt-1 text-small text-muted">{point.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
