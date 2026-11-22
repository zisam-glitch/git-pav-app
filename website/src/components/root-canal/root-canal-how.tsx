import { CheckCircle2, Play, Shield, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { BookButton, CallButton, Heading, Media, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";

const PROCEDURE_STEPS = [
  {
    id: "numb-access",
    title: "Local Anaesthesia & Access",
    desc: "The area is gently numbed for comfort before accessing the damaged or infected tooth pulp.",
    icon: Shield,
  },
  {
    id: "clean-shape",
    title: "Canal Cleaning & Shaping",
    desc: "Infected pulp is removed and the root canals are carefully cleaned, disinfected, and shaped.",
    icon: Sparkles,
  },
  {
    id: "seal-restore",
    title: "Biocompatible Seal & Restoration",
    desc: "Canals are sealed with a biocompatible material to prevent reinfection and protect your natural tooth.",
    icon: CheckCircle2,
  },
] as const;

export function RootCanalHow() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-pill bg-white/10 px-3.5 py-1.5 text-caption font-medium text-gold">
            Step-by-Step Clinical Walkthrough
          </p>
          <Heading
            as="h2"
            size="hero"
            accent="is done."
            tone="gold"
            inline
            className="mt-4"
          >
            How the Root canal treatment
          </Heading>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <BookButton variant="gold">Book Now</BookButton>
          <CallButton variant="glass" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PROCEDURE_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Tile
              key={step.id}
              tone="glass"
              className="flex flex-col gap-4 border border-white/12 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-white/10 text-gold">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="rounded-pill bg-white/10 px-2.5 py-0.5 text-caption font-medium text-gold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="border-t border-white/12 pt-4 text-h4 text-white">{step.title}</h3>
              <p className="text-body text-white/80">{step.desc}</p>
            </Tile>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/12 bg-brown-deep">
        <div className="relative aspect-video">
          {isPlaying ? (
            <div className="relative size-full">
              <video
                src="/media/clinic-reel.mp4"
                autoPlay
                controls
                loop
                aria-label="How the Root canal treatment is done"
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="light"
                size="icon"
                onClick={() => setIsPlaying(false)}
                aria-label="Close root canal walkthrough video"
                className="absolute top-4 right-4 z-20"
              >
                <X aria-hidden className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="relative size-full">
              <Media
                src="/images/generated/root-canal-how.jpg"
                alt="Pav Dental clinical room prepared for root canal treatment"
                ratio="16 / 9"
                tone="brown"
                className="size-full rounded-none bg-white/10"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 p-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex size-20 items-center justify-center rounded-full bg-gold text-brown shadow-card t-colors hover:bg-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                  aria-label="Play root canal walkthrough video"
                >
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current sm:size-9" />
                </button>
                <p className="text-label text-white">Watch treatment walkthrough</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
