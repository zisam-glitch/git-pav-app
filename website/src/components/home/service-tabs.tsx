import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { Ambulance, Sparkles, Stethoscope, Sun, Truck, Wrench } from "lucide-react";
import { Reveal } from "./reveal";

const SERVICES = [
  {
    id: "emergency",
    title: "Emergency",
    icon: Ambulance,
    copy: "Same-day pain relief, trauma, and lost restorations — 24 hours, every day, including bank holidays.",
    points: ["Walk-in or call first", "On-call clinician", "Immediate imaging when needed"],
  },
  {
    id: "general",
    title: "General",
    icon: Stethoscope,
    copy: "Check-ups from £35, hygiene assessments, and unhurried treatment plans with GDC-registered clinicians.",
    points: ["£35 complete check-up", "Insurance support", "Free online booking"],
  },
  {
    id: "aesthetics",
    title: "Aesthetics",
    icon: Sparkles,
    copy: "Whitening, veneers, and considered smile design — photography-led, never aggressive.",
    points: ["Digital imaging", "Shade matching", "Staged plans"],
  },
  {
    id: "mobile",
    title: "Mobile",
    icon: Truck,
    copy: "Domiciliary dentistry for patients who cannot easily travel — Bradford and surrounding areas.",
    points: ["Home visits", "Care-home sessions", "Accessible equipment"],
  },
  {
    id: "extraction",
    title: "Surgery",
    icon: Wrench,
    copy: "Oral surgery and extractions with clear aftercare. We explain every step before we begin.",
    points: ["Surgical extraction", "Sedation discussion", "Written aftercare"],
  },
  {
    id: "whitening",
    title: "Whitening",
    icon: Sun,
    copy: "Supervised whitening that respects enamel. Results you can maintain, not a one-night blast.",
    points: ["In-chair or take-home", "Sensitivity protocol", "Shade review"],
  },
] as const;

export function ServiceTabs() {
  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-medium text-primary">Care</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Six ways we look after you</h2>
        </Reveal>

        <Tabs.Root defaultValue="emergency" className="mt-10">
          <Tabs.List className="flex snap-x gap-2 overflow-x-auto pb-2">
            {SERVICES.map((s) => (
              <Tabs.Trigger
                key={s.id}
                value={s.id}
                className="snap-start inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm text-muted transition-colors duration-150 hover:border-primary data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-fg"
              >
                <s.icon className="size-4" />
                {s.title}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {SERVICES.map((s) => (
            <Tabs.Content key={s.id} value={s.id} className="mt-8 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35 }}
                className="grid gap-8 lg:grid-cols-[1fr_0.7fr]"
              >
                <div>
                  <h3 className="font-display text-2xl">{s.title} dentistry</h3>
                  <p className="mt-3 max-w-xl text-muted">{s.copy}</p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-2 text-fg">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border-soft bg-white p-6 shadow-soft">
                  <p className="text-sm text-muted">Typical next step</p>
                  <p className="mt-2 font-display text-xl">
                    Book a £35 assessment or call the emergency line if you are in pain now.
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex h-11 items-center rounded-full accent-gradient px-5 text-sm font-medium text-primary-fg"
                  >
                    Continue
                  </a>
                </div>
              </motion.div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
