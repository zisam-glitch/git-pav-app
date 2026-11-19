import { Heading, Section, Tile } from "@/components/hims";

const BENEFITS = [
  "Unique mobile dental service",
  "Working with care homes",
  "Make your home oral-health CQC-compliant",
  "NHS partners",
  "The very latest mobile dental equipment",
  "Hundreds of satisfied patients",
  "Attract more residents",
  "Engage carers and improve staff retention",
] as const;

export function MobileDentistryBenefits() {
  return (
    <Section theme="cream" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="dental needs?" tone="terracotta" inline>
          Concerned about your residents&apos;
        </Heading>
        <p className="mt-4 text-lead text-muted">We Are The Dentists That Come To You.</p>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit, index) => (
          <Tile
            key={benefit}
            as="li"
            tone="white"
            lift
            className="flex flex-col justify-between gap-6 p-6"
          >
            <span className="text-caption font-medium text-terracotta tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h4 text-fg">{benefit}</h3>
          </Tile>
        ))}
      </ol>
    </Section>
  );
}
