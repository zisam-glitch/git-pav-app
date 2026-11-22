import { AlertCircle, CheckCircle2, FileText, Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, ConsentPanel, Media, Section, type ConsentItem } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { Button } from "@/components/ui/button";

const CONSENT_ITEMS: readonly ConsentItem[] = [
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

function OralHygieneConsentVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePart, setActivePart] = useState(CONSENT_VIDEOS[0].id);

  const currentVideo = CONSENT_VIDEOS.find((v) => v.id === activePart) ?? CONSENT_VIDEOS[0];

  return (
    <Section theme="white">
      <SectionHeader
        title="Oral Hygiene and Gum Care"
        accent="Advice"
        action={<BookButton>Book Now</BookButton>}
      />
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
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActivePart(video.id);
                setIsPlaying(false);
              }}
            >
              {video.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-tile-sage">
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
                tone="sage"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/25 p-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="grid size-20 place-items-center rounded-full bg-white text-black shadow-card t-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                  aria-label={`Play ${currentVideo.label}`}
                >
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
                </button>
                <p className="rounded-pill bg-black/60 px-4 py-2 text-label text-white">
                  {currentVideo.label}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

export function OralHygieneConsent() {
  return (
    <>
      <ConsentPanel
        theme="white"
        title="Understanding"
        accent="Informed Consent"
        intro="Before proceeding with any dental hygiene treatment, we ensure you fully understand the procedure, risks, and benefits. Your comfort and understanding are our priorities."
        items={CONSENT_ITEMS}
      />
      <OralHygieneConsentVideo />
    </>
  );
}
