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
        <p className="inline-flex rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
          When to Visit
        </p>
        <Heading as="h2" size="h2-md" accent="Treatment?" tone="terracotta" inline className="mt-4">
          Who Needs Hygiene
        </Heading>
        <p className="mt-4 text-lead text-muted">You may need to see our hygienist if you have:</p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INDICATORS.map((item, index) => (
          <Tile
            key={item}
            as="li"
            tone="cream"
            lift
            className="flex flex-col justify-between gap-5 border border-border p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-pill bg-white px-2.5 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                0{index + 1}
              </span>
              <Plus aria-hidden className="size-4 text-terracotta" />
            </div>
            <h3 className="border-t border-border pt-4 text-h4 text-fg">{item}</h3>
          </Tile>
        ))}

        <Tile
          as="li"
          tone="sage"
          className="flex flex-col justify-between gap-4 border border-border p-6"
        >
          <span className="inline-flex w-fit rounded-pill bg-white px-2.5 py-0.5 text-caption font-medium text-fg">
            Restorative Care
          </span>
          <p className="border-t border-border pt-4 text-body font-medium text-fg">
            Regular hygiene appointments are also essential if you wear braces, dentures, crowns,
            veneers, bridges, or implants.
          </p>
        </Tile>
      </ul>
    </Section>
  );
}
