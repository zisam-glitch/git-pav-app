import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Heading, Media, Section, SplitFeature, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";

const DEMOS = [
  {
    id: "scale-polish",
    title: "Professional Scale & Polish",
    desc: "Combining scaling and polishing to remove hardened plaque and tartar from above and just below the gumline, then smoothing teeth to enhance shine.",
  },
  {
    id: "gum-treatment",
    title: "Gum Care & Prevention",
    desc: "Gentle hygiene treatment paired with tailored home-care advice to help reduce inflammation, bleeding gums, and bad breath.",
  },
];

export function OralHygieneShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <Section theme="cream" space="default">
      <SplitFeature
        media={
          <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-black/8">
            {activeVideo ? (
              <div className="relative aspect-[4/3] w-full bg-black">
                <video
                  src="/media/clinic-reel.mp4"
                  autoPlay
                  controls
                  loop
                  className="size-full object-cover"
                />
                <Button
                  type="button"
                  variant="light"
                  size="icon"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close hygiene treatment preview video"
                  className="absolute top-4 right-4 z-20"
                >
                  <X aria-hidden className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Media
                  src="/images/generated/oral-hygiene-showcase.jpg"
                  alt="Professional dental hygiene scaling and polishing instruments arranged in warm studio light"
                  ratio="4 / 3"
                  tone="sand"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <button
                    type="button"
                    onClick={() => setActiveVideo(DEMOS[0].id)}
                    aria-label="Play hygiene treatment preview video"
                    className="flex size-20 items-center justify-center rounded-full bg-white text-black shadow-card t-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      >
        <div>
          <p className="inline-flex rounded-pill border border-border bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
            Gentle Clinical Care
          </p>
          <Heading as="h2" size="h2-md" accent="in Action" tone="terracotta" className="mt-4">
            Hygiene Treatment
          </Heading>
          <div className="mt-6 grid gap-3">
            {DEMOS.map((demo, index) => {
              const isPlaying = activeVideo === demo.id;
              return (
                <Tile key={demo.id} tone="white" lift className="p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                        0{index + 1}
                      </span>
                      <h3 className="mt-3 text-h4 text-fg">{demo.title}</h3>
                      <p className="mt-2 text-body text-muted">{demo.desc}</p>
                    </div>
                    <Button
                      type="button"
                      variant={isPlaying ? "default" : "outline"}
                      size="icon"
                      onClick={() => setActiveVideo(isPlaying ? null : demo.id)}
                      aria-label={isPlaying ? `Stop ${demo.title}` : `Play ${demo.title}`}
                    >
                      {isPlaying ? (
                        <X aria-hidden className="size-4" />
                      ) : (
                        <Play aria-hidden className="size-4 translate-x-0.5" />
                      )}
                    </Button>
                  </div>
                </Tile>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
