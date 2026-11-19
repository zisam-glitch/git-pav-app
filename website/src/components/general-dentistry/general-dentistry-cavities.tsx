import { Play, X } from "lucide-react";
import { useState } from "react";
import { Heading, Media, Section } from "@/components/hims";

export function GeneralDentistryCavities() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section theme="cream">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Form?" tone="terracotta" inline>
          How Do Dental Cavities
        </Heading>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-sand">
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
                className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-black text-white t-colors hover:bg-black/80"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Media
                src="/media/thumbnails/1.jpg"
                ratio="16 / 9"
                tone="sand"
                alt="How dental cavities form - visual overview"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play cavity formation explanation"
                  className="inline-flex h-12 items-center gap-2.5 rounded-pill bg-black px-6 text-label text-white t-colors hover:bg-black/80"
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
