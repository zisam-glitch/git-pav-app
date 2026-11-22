import {
  AlertTriangle,
  BedDouble,
  CalendarCheck,
  CigaretteOff,
  Droplets,
  Info,
  Pill,
  ShieldCheck,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = "all" | "first-24h" | "recovery";

const INSTRUCTIONS = [
  {
    title: "Pain Management:",
    category: "first-24h" as const,
    icon: Pill,
    steps: [
      "Use over-the-counter pain relievers like ibuprofen or acetaminophen as directed.",
      "If prescribed pain medication, take as instructed.",
    ],
  },
  {
    title: "Swelling and Bruising:",
    category: "first-24h" as const,
    icon: Snowflake,
    steps: [
      "Apply an ice pack to the cheek near the extraction site for 10 minutes on, then 10 minutes off, during the first 24 hours.",
    ],
  },
  {
    title: "Rest:",
    category: "first-24h" as const,
    icon: BedDouble,
    steps: [
      "Relax for at least 24 hours after the extraction.",
      "Avoid strenuous activities for 2-3 days to reduce bleeding and help the healing process.",
    ],
  },
  {
    title: "Oral Hygiene:",
    category: "recovery" as const,
    icon: Sparkles,
    steps: [
      "Do not rinse your mouth for the first 24 hours.",
      "After 24 hours, gently rinse with warm salt water (1/2 teaspoon of salt in a cup of water) after meals and before bed.",
    ],
  },
  {
    title: "Bleeding Management:",
    category: "first-24h" as const,
    icon: Droplets,
    steps: [
      "Bite on a gauze pad firmly for 30-60 minutes after the extraction.",
      "If bleeding continues, replace the gauze and bite down for another 30 minutes.",
    ],
  },
  {
    title: "Eating and Drinking:",
    category: "first-24h" as const,
    icon: UtensilsCrossed,
    steps: [
      "Start with soft foods and liquids.",
      "Avoid using a straw for the first few days to prevent dislodging the blood clot.",
      "Avoid hot liquids and alcoholic beverages in the first 24 hours.",
    ],
  },
  {
    title: "Smoking:",
    category: "recovery" as const,
    icon: CigaretteOff,
    steps: [
      "Avoid smoking for as long as possible after the extraction, ideally for at least 48 hours.",
    ],
  },
  {
    title: "Protect the Clot:",
    category: "recovery" as const,
    icon: ShieldCheck,
    steps: ["Avoid spitting or rinsing forcefully.", "Chew on the opposite side of your mouth."],
  },
  {
    title: "Medications:",
    category: "recovery" as const,
    icon: Pill,
    steps: ["Take any prescribed antibiotics as directed to prevent infection."],
  },
  {
    title: "Follow-Up:",
    category: "recovery" as const,
    icon: CalendarCheck,
    steps: ["Keep any follow-up appointments with your dentist or oral surgeon."],
  },
];

const FILTERS: Array<{ id: Category; label: string }> = [
  { id: "all", label: "All instructions" },
  { id: "first-24h", label: "First 24 hours" },
  { id: "recovery", label: "Care & follow-up" },
];

export function ExtractionPostOp() {
  const [filter, setFilter] = useState<Category>("all");

  return (
    <Section id="post-op" theme="cream" space="default">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2-md" accent="Instructions" tone="terracotta" inline>
            Post Operative
          </Heading>
        </div>

        <div
          className="inline-flex flex-wrap gap-1.5 rounded-pill border border-border bg-white p-1.5"
          role="tablist"
          aria-label="Filter post-op instructions"
        >
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                variant={active ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Tile tone="white" className="mt-8 flex items-start gap-4 p-5 md:p-[25px]">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-terracotta">
          <Info aria-hidden className="size-5" />
        </span>
        <div>
          <h3 className="text-h4 text-fg">Reminder:</h3>
          <p className="mt-2 text-body text-muted">
            Remember, these are general guidelines. Always adhere to the specific instructions given
            by your healthcare provider, as they may have additional or different recommendations
            based on your individual case and health history.
          </p>
        </div>
      </Tile>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INSTRUCTIONS.map((section) => {
          const matches = filter === "all" || section.category === filter;
          return (
            <article
              key={section.title}
              hidden={!matches}
              className={cn(
                "flex flex-col gap-4 rounded-md bg-white p-5 md:p-[25px]",
                !matches && "hidden",
              )}
            >
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-cream text-terracotta"
              >
                <section.icon className="size-4" />
              </span>
              <h3 className="text-[1.125rem] leading-[1.16] font-medium md:text-[1.385rem]">
                {section.title}
              </h3>
              <p className="space-y-2 text-body text-muted">
                {section.steps.map((step, idx) => (
                  <span key={step} className="flex items-start gap-2">
                    {idx > 0 ? " " : null}
                    <span className="shrink-0 font-medium text-terracotta">- </span>
                    <span>{step}</span>
                  </span>
                ))}
              </p>
            </article>
          );
        })}
      </div>

      <Tile tone="navy" className="mt-6 p-6 md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-butter">
              <AlertTriangle aria-hidden className="size-5" />
            </span>
            <div>
              <h3 className="text-h3-md text-white">Watch for Complications:</h3>
              <p className="mt-2 text-body text-white/80">
                - Look out for signs of infection like fever, severe pain, or swelling that worsens
                after a few days. Also, be aware of dry socket, a condition where the blood clot
                fails to develop or is dislodged, leading to delayed healing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <CallButton variant="butter" />
            <BookButton variant="glass">Make an Appointment</BookButton>
          </div>
        </div>
      </Tile>
    </Section>
  );
}
