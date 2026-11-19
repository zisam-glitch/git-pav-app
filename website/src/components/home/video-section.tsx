import { Play, X } from "lucide-react";
import { useState } from "react";
import { Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section id="video" theme="white" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="cavities?" tone="terracotta">
          What causes
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Watch our short dental guide explaining what causes cavities and how daily care protects
          your enamel.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-cream">
        <div className="relative aspect-video bg-cream">
          {isPlaying ? (
            <div className="relative size-full">
              <iframe
                src="https://www.youtube.com/embed/zHXljj727OE?si=Uz7mq8eE5tSAvpgy&autoplay=1&controls=0&loop=1&playlist=zHXljj727OE&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3"
                title="What causes cavities? — Pav Dental"
                className="size-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <Button
                type="button"
                variant="light"
                size="icon"
                onClick={() => setIsPlaying(false)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-20"
              >
                <X aria-hidden className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <img
                src="/media/thumbnails/1.jpg"
                alt="What causes cavities? educational dental video thumbnail"
                loading="lazy"
                className="size-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/25" />

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex size-20 items-center justify-center rounded-full bg-white text-black shadow-card t-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                  aria-label="Play What causes cavities? video"
                >
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current sm:size-9" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
