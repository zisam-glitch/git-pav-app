import { Heading, Section, Tile } from "@/components/hims";

const CHOOSING_FACTORS = [
  {
    title: "Qualifications",
    desc: "Make sure the dentist is board-certified and has good reviews.",
  },
  {
    title: "Location",
    desc: "A conveniently located clinic will make regular visits easier.",
  },
  {
    title: "Services Offered",
    desc: "Ensure that the dental office offers the range of services you and your family may need.",
  },
  {
    title: "Insurance",
    desc: "Check if the dental practice accepts your insurance.",
  },
] as const;

export function GeneralDentistryChoosing() {
  return (
    <Section theme="cream">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="General Dentist" tone="terracotta" inline>
          How to Choose a
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHOOSING_FACTORS.map((factor, i) => (
          <Tile key={factor.title} tone="white" className="p-6">
            <span className="text-small font-medium tabular-nums text-terracotta">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-body text-muted">
              <strong className="font-medium text-fg">{factor.title}:</strong> {factor.desc}
            </p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
