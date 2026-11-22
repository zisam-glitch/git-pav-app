import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Media, Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";

export function GeneralDentistryCavities() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section theme="white">
      <SectionHeader
        title="How Do Dental Cavities"
        accent="Form?"
        action={<BookButton>Book Appointment</BookButton>}
      />
      <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-tile-sage md:mt-14">
        <div className="relative aspect-video w-full">
          {isPlaying ? (
            <div className="relative size-full bg-black">
              <video
                src="/media/clinic-reel.mp4"
                autoPlay
                controls
                loop
                aria-label="How dental cavities form"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white text-black t-colors hover:bg-white/85"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Media
                src="/media/thumbnails/1.jpg"
                ratio="16 / 9"
                tone="sage"
                alt="How dental cavities form - visual overview"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play cavity formation explanation"
                  className="inline-flex h-12 items-center gap-2.5 rounded-pill bg-white px-6 text-label text-black shadow-card t-colors hover:bg-white/85"
                >
                  <Play aria-hidden className="size-4 fill-current" />
                  <span>Watch video</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
