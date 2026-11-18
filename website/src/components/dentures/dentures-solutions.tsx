import { Heading, Section, Tile } from "@/components/hims";

const SOLUTIONS = [
  "Full Dentures",
  "Partial Dentures",
  "Implant-Supported Dentures",
  "Flexible Dentures",
] as const;

export function DenturesSolutions() {
  return (
    <Section id="solutions" theme="cream">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="denture solutions, including:" tone="terracotta" inline>
          We offer a variety of
        </Heading>
        <p className="mt-4 text-lead font-medium text-fg">We Are The Dentists That Come To You.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((title, i) => (
          <Tile key={title} tone="white" className="p-6">
            <span className="text-small font-medium tabular-nums text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 text-fg">{title}</h3>
          </Tile>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 md:p-8">
        <h3 className="text-h4 text-fg">Affordable Denture Options</h3>
        <p className="mt-2 max-w-3xl text-body text-muted">
          Our team of skilled professionals uses the latest technology to scan, design, and fit
          dentures that look and feel natural. We prioritize both comfort and aesthetics in every
          set we create.
        </p>
      </div>
    </Section>
  );
}
