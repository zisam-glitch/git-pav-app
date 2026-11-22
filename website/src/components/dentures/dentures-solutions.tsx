import { CheckCircle2, Layers, Shield, Sparkles } from "lucide-react";
import { BookButton, Heading, Section, Tile } from "@/components/hims";

const SOLUTIONS = [
  { title: "Full Dentures", icon: Sparkles },
  { title: "Partial Dentures", icon: Layers },
  { title: "Implant-Supported Dentures", icon: Shield },
  { title: "Flexible Dentures", icon: CheckCircle2 },
] as const;

export function DenturesSolutions() {
  return (
    <Section id="solutions" theme="cream">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-pill border border-border bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
          Tailored Restorations
        </p>
        <Heading
          size="h2-md"
          accent="denture solutions, including:"
          tone="terracotta"
          inline
          className="mt-4"
        >
          We offer a variety of
        </Heading>
        <p className="mt-4 text-lead font-medium text-fg">We Are The Dentists That Come To You.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <Tile
              key={item.title}
              tone="white"
              lift
              className="flex flex-col justify-between gap-6 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-cream text-terracotta">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium tabular-nums text-terracotta">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="border-t border-border pt-4 text-h4 text-fg">{item.title}</h3>
            </Tile>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-white p-6 md:flex-row md:items-center md:p-8">
        <div>
          <h3 className="text-h4 text-fg">Affordable Denture Options</h3>
          <p className="mt-2 max-w-3xl text-body text-muted">
            Our team of skilled professionals uses the latest technology to scan, design, and fit
            dentures that look and feel natural. We prioritize both comfort and aesthetics in every
            set we create.
          </p>
        </div>
        <BookButton variant="outline" className="shrink-0">
          Book Consultation
        </BookButton>
      </div>
    </Section>
  );
}
