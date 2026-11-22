import { Layers, Sparkles } from "lucide-react";
import { BookButton, CallButton, Heading, Media, Section, SplitFeature, Tile } from "@/components/hims";

const SHOWCASE_OPTIONS = [
  {
    id: "intermediate",
    label: "Intermediate - acrylic with clasps",
    detail: "Secure retention with discreet clasp support for everyday comfort.",
    icon: Layers,
  },
  {
    id: "premium",
    label: "Premium - Flexible denture",
    detail: "Lightweight, gum-coloured flexible Valplast design with a natural fit.",
    icon: Sparkles,
  },
] as const;

export function DenturesShowcase() {
  return (
    <Section theme="brown" space="lg">
      <SplitFeature
        media={
          <Media
            src="/images/generated/dentures-showcase.jpg"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10 ring-1 ring-white/12"
            alt="Acrylic and flexible denture craftsmanship on a calm dark studio surface"
          />
        }
      >
        <div>
          <p className="inline-flex rounded-pill bg-white/10 px-3.5 py-1.5 text-caption font-medium text-gold">
            Prosthetic Craftsmanship
          </p>
          <Heading size="h2-md" tone="gold" className="mt-4">
            Dentures
          </Heading>

          <div className="mt-6 flex flex-col gap-3">
            {SHOWCASE_OPTIONS.map((option, i) => {
              const Icon = option.icon;
              return (
                <Tile
                  key={option.id}
                  tone="glass"
                  className="border border-white/12 p-5 md:p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-white/10 text-gold">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <span className="rounded-pill bg-white/10 px-2.5 py-0.5 text-caption font-medium tabular-nums text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-4 border-t border-white/12 pt-4 text-h4 text-white">
                    {option.label}
                  </p>
                  <p className="mt-1.5 text-small text-white/75">{option.detail}</p>
                </Tile>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
