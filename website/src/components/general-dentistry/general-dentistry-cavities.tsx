import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Heading, Media, Section } from "@/components/hims";

export function GeneralDentistryCavities() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section theme="navy" width="bento" space="lg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-pill bg-white/10 px-3.5 py-1.5 text-caption font-medium text-butter">
            Patient Education
          </p>
          <Heading as="h2" size="h2-md" accent="Form?" tone="butter" inline className="mt-4">
            How Do Dental Cavities
          </Heading>
        </div>
        <BookButton variant="butter">Book Appointment</BookButton>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/12 bg-navy-deep">
        <div className="relative aspect-video w-full">
          {isPlaying ? (
            <div className="relative size-full bg-black">
              <video
                src="/media/clinic-reel.mp4"
                autoPlay
                controls
                loop
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-white text-black t-colors hover:bg-white/85"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Media
                src="/media/thumbnails/1.jpg"
                ratio="16 / 9"
                tone="navy"
                alt="How dental cavities form - visual overview"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play cavity formation explanation"
                  className="inline-flex h-12 items-center gap-2.5 rounded-pill bg-butter px-6 text-label text-teal-ink shadow-card t-colors hover:bg-butter-pale"
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
