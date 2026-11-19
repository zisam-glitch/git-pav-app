import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Heading, Media, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";

export function RootCanalHow() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-brown py-14 text-white md:py-[7.5rem]">
        <div className="wrap-bento">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Heading as="h2" size="hero" accent="is done." tone="gold" inline>
                How the Root canal treatment
              </Heading>
            </div>
            <BookButton variant="gold">Book Now</BookButton>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl bg-brown-deep">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="flex size-20 items-center justify-center rounded-full bg-gold text-brown shadow-card t-colors hover:bg-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                      aria-label="Play root canal walkthrough video"
                    >
                      <Play aria-hidden className="size-8 translate-x-0.5 fill-current sm:size-9" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
