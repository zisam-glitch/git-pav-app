import { Plus } from "lucide-react";
import { Heading, Section, Tile } from "@/components/hims";

const BENEFITS = [
  "Prevent gum disease",
  "Stop bleeding and swollen gums",
  "Reduce bad breath",
  "Remove plaque and hard tartar",
  "Improve overall health",
  "Protect dental work like crowns and implants",
];

export function OralHygieneImportance() {
  return (
    <Section id="importance" theme="cream" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="Matters" tone="terracotta" inline>
          Why Your Oral Hygiene
        </Heading>
        <p className="mt-4 text-lead text-muted">Good hygiene care helps to:</p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => (
          <Tile key={benefit} as="li" tone="white" className="flex items-start gap-4 p-6">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-small font-medium text-terracotta tabular-nums">
              0{index + 1}
            </span>
            <div className="flex items-start gap-2 pt-0.5">
              <Plus aria-hidden className="mt-1 size-4 shrink-0 text-terracotta" />
              <h3 className="text-h4 text-fg">{benefit}</h3>
            </div>
          </Tile>
        ))}
      </ul>

      <Tile tone="white" className="mt-6 p-6 md:p-8">
        <p className="max-w-3xl text-lead text-fg">
          Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks,
          and infections. Regular dental hygiene visits keep your smile and your health protected.
        </p>
      </Tile>
    </Section>
  );
}
