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
    <Section id="importance" theme="sand" space="default">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-pill bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
          Clinical Prevention
        </p>
        <Heading as="h2" size="h2-md" accent="Matters" tone="terracotta" inline className="mt-4">
          Why Your Oral Hygiene
        </Heading>
        <p className="mt-4 text-lead text-muted">Good hygiene care helps to:</p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => (
          <Tile
            key={benefit}
            as="li"
            tone="white"
            lift
            className="flex flex-col justify-between gap-5 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                0{index + 1}
              </span>
              <Plus aria-hidden className="size-4 text-terracotta" />
            </div>
            <h3 className="border-t border-border pt-4 text-h4 text-fg">{benefit}</h3>
          </Tile>
        ))}
      </ul>

      <Tile
        tone="navy"
        className="mt-6 grid items-center gap-4 p-6 md:grid-cols-[auto_1fr] md:gap-8 md:p-8"
      >
        <span className="inline-flex w-fit rounded-pill bg-white/10 px-3.5 py-1.5 text-caption font-medium text-butter">
          Whole-Body Health
        </span>
        <p className="max-w-3xl text-lead text-white/90">
          Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks,
          and infections. Regular dental hygiene visits keep your smile and your health protected.
        </p>
      </Tile>
    </Section>
  );
}
