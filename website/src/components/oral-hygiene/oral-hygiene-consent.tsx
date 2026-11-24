import { Play, X } from "lucide-react";
import { useState } from "react";
import { Media, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";

const CONSENT_VIDEOS = [
  { id: "part-1", label: "Informed Consent - Gum Disease Part 1" },
  { id: "part-2", label: "Informed Consent - Gum Disease Part 2" },
  { id: "part-3", label: "Informed Consent - Gum Disease Part 3" },
];

export function OralHygieneConsent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePart, setActivePart] = useState(CONSENT_VIDEOS[0].id);
  const current = CONSENT_VIDEOS.find((v) => v.id === activePart) ?? CONSENT_VIDEOS[0];

  return (
    <Section id="consent" theme="white" aria-labelledby="oral-hygiene-consent-heading">
      <div className="mx-auto max-w-[900px]">
        <h2
          id="oral-hygiene-consent-heading"
          className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          Oral Hygiene and <span className="text-[#4a5c66]">Gum Care Advice</span>
        </h2>
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Informed consent advice"
        >
          {CONSENT_VIDEOS.map((video) => (
            <Button
              key={video.id}
              type="button"
              role="tab"
              aria-selected={video.id === activePart}
              variant={video.id === activePart ? "gold" : "outline"}
              size="sm"
              onClick={() => setActivePart(video.id)}
            >
              {video.label}
            </Button>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-[24px] bg-[#3a2c1b]">
          <div className="relative aspect-video">
            {isPlaying ? (
              <>
                <video
                  src="/media/clinic-reel.mp4"
                  autoPlay
                  controls
                  loop
                  aria-label={current.label}
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
              </>
            ) : (
              <>
                <Media
                  src="/images/generated/oral-hygiene-showcase.jpg"
                  alt={current.label}
                  ratio="16 / 9"
                  tone="brown"
                  className="size-full rounded-none"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 p-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    aria-label={`Play ${current.label}`}
                    className="flex size-20 items-center justify-center rounded-full bg-gold text-brown shadow-card t-colors hover:bg-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
                  </button>
                  <p className="text-label text-white">{current.label}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
