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
    <Section theme="white">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
          Choosing Your Clinic
        </p>
        <Heading size="h2-md" accent="General Dentist" tone="terracotta" inline className="mt-4">
          How to Choose a
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHOOSING_FACTORS.map((factor, i) => (
          <Tile
            key={factor.title}
            tone="cream"
            lift
            className="flex flex-col gap-4 border border-border p-6"
          >
            <span className="inline-flex w-fit rounded-pill bg-white px-2.5 py-0.5 text-caption font-medium tabular-nums text-terracotta">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="border-t border-border pt-3 text-body text-muted">
              <strong className="font-medium text-fg">{`${factor.title}:`}</strong> {factor.desc}
            </p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
