import { Plus } from "lucide-react";
import { Heading, Section, Tile } from "@/components/hims";

const INDICATORS = [
  "Bleeding gums",
  "Bad breath",
  "Gum swelling or tenderness",
  "Stains on teeth",
  "Loose teeth",
  "Sensitive gums",
  "Diabetes or medical conditions that affect healing",
];

export function OralHygieneWhoNeeds() {
  return (
    <Section theme="white" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="Treatment?" tone="terracotta" inline>
          Who Needs Hygiene
        </Heading>
        <p className="mt-4 text-lead text-muted">You may need to see our hygienist if you have:</p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INDICATORS.map((item, index) => (
          <Tile key={item} as="li" tone="cream" className="flex flex-col justify-between gap-4 p-6">
            <div className="flex items-center justify-between gap-2">
              <span className="text-small font-medium text-terracotta tabular-nums">
                0{index + 1}
              </span>
              <Plus aria-hidden className="size-4 text-terracotta" />
            </div>
            <h3 className="text-h4 text-fg">{item}</h3>
          </Tile>
        ))}
      </ul>

      <Tile tone="sage" className="mt-6 p-6 md:p-8">
        <p className="max-w-3xl text-lead text-fg">
          Regular hygiene appointments are also essential if you wear braces, dentures, crowns,
          veneers, bridges, or implants.
        </p>
      </Tile>
    </Section>
  );
}
