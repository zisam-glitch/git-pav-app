import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";

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
    <Section theme="brown" space="lg" aria-labelledby="mouthguards-why-choose-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3.5 py-1 text-caption font-medium text-gold">
            Clinical Fit &amp; Protection
          </span>
          <div id="mouthguards-why-choose-heading" className="mt-4">
            <Heading size="h2-md" accent="Pav Dental Mouthguards?" tone="gold" inline>
              Why Choose
            </Heading>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <BookButton variant="gold">Make an Appointment</BookButton>
          <CallButton variant="glass" />
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((title, i) => (
          <Tile
            key={title}
            tone="glass"
            className="flex flex-col justify-between gap-5 border border-white/15 p-6"
          >
            <span className="inline-flex w-fit items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-gold tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h4 text-white">{title}</h3>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
