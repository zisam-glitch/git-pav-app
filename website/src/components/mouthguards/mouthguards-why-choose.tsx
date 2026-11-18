import { Heading, Section, Tile } from "@/components/hims";

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
    <Section theme="white">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Pav Dental Mouthguards?" tone="terracotta" inline>
          Why Choose
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((title, i) => (
          <Tile key={title} tone="cream" className="p-6">
            <span className="text-small font-medium tabular-nums text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 text-fg">{title}</h3>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
