import { Heading, Section } from "@/components/hims";

const DENTURE_TYPES = ["Intermediate - acrylic with clasps", "Premium - Flexible denture"] as const;

export function DenturesShowcase() {
  return (
    <Section theme="brown" space="lg">
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center md:gap-16">
        <Heading as="h2" size="h2-md" tone="gold">
          Dentures
        </Heading>
        <ul className="grid gap-4 sm:grid-cols-2">
          {DENTURE_TYPES.map((text) => (
            <li
              key={text}
              className="flex min-h-40 items-end rounded-2xl border border-white/20 bg-white/5 p-6 md:p-8"
            >
              <p className="text-lead text-white">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
