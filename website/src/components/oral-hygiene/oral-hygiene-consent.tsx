import { AlertCircle, CheckCircle2, FileText, Play, X } from "lucide-react";
import { useState } from "react";
import { Heading, Media, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";

const CONSENT_ITEMS = [
  {
    title: "Treatment Understanding",
    desc: "I understand the nature of the dental hygiene treatment, including the procedures to be performed and the expected outcomes.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "I have been informed of the potential risks and benefits of the treatment, including possible side effects and alternatives.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "I understand that my participation in this treatment is voluntary and I may withdraw consent at any time.",
    icon: CheckCircle2,
  },
];

const CONSENT_VIDEOS = [
  { id: "part-1", label: "Informed Consent - Gum Disease Part 1" },
  { id: "part-2", label: "Informed Consent - Gum Disease Part 2" },
  { id: "part-3", label: "Informed Consent - Gum Disease Part 3" },
];

export function OralHygieneConsent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePart, setActivePart] = useState(CONSENT_VIDEOS[0].id);

  const currentVideo = CONSENT_VIDEOS.find((v) => v.id === activePart) ?? CONSENT_VIDEOS[0];

  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="max-w-2xl">
        <Heading as="h2" size="hero" accent="Informed Consent" tone="gold" className="mt-4">
          Understanding
        </Heading>
        <p className="mt-4 text-lead text-white/80">
          Before proceeding with any dental hygiene treatment, we ensure you fully understand the
          procedure, risks, and benefits. Your comfort and understanding are our priorities.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {CONSENT_ITEMS.map((item, index) => (
          <Tile
            key={item.title}
            tone="glass"
            className="flex flex-col gap-4 border border-white/12 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white/10 text-gold">
                <item.icon aria-hidden className="size-4" />
              </span>
              <span className="rounded-pill bg-white/10 px-2.5 py-0.5 text-caption font-medium text-gold tabular-nums">
                0{index + 1}
              </span>
            </div>
            <h3 className="border-t border-white/12 pt-4 text-h4 text-white">{item.title}</h3>
            <p className="text-body text-white/80">{item.desc}</p>
          </Tile>
        ))}
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Informed consent advice"
      >
        {CONSENT_VIDEOS.map((video) => {
          const selected = video.id === activePart;
          return (
            <Button
              key={video.id}
              type="button"
              role="tab"
              aria-selected={selected}
              variant={selected ? "gold" : "glass"}
              size="sm"
              onClick={() => setActivePart(video.id)}
            >
              {video.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-brown-deep">
        <div className="relative aspect-video">
          {isPlaying ? (
            <div className="relative size-full">
              <video
                src="/media/clinic-reel.mp4"
                autoPlay
                controls
                loop
                aria-label={currentVideo.label}
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="light"
                size="icon"
                onClick={() => setIsPlaying(false)}
                aria-label="Close informed consent video"
                className="absolute top-4 right-4 z-20"
              >
                <X aria-hidden className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="relative size-full">
              <Media
                src="/images/generated/oral-hygiene-showcase.jpg"
                alt={currentVideo.label}
                ratio="16 / 9"
                tone="brown"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 p-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex size-20 items-center justify-center rounded-full bg-gold text-brown shadow-card t-colors hover:bg-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                  aria-label={`Play ${currentVideo.label}`}
                >
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
                </button>
                <p className="text-label text-white">{currentVideo.label}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
