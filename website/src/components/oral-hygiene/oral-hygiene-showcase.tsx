import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Media } from "@/components/hims";
import { Steps, type Step } from "@/components/hims/steps";
import { Button } from "@/components/ui/button";

const DEMOS: readonly Step[] = [
  {
    title: "Professional Scale & Polish",
    body: "Combining scaling and polishing to remove hardened plaque and tartar from above and just below the gumline, then smoothing teeth to enhance shine.",
  },
  {
    title: "Gum Care & Prevention",
    body: "Gentle hygiene treatment paired with tailored home-care advice to help reduce inflammation, bleeding gums, and bad breath.",
  },
];

/** The picture; a click swaps it for the clinic video (a feature, kept from the first pass). */
function Walkthrough() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl bg-sand">
      {isPlaying ? (
        <div className="relative aspect-[4/3]">
          <video
            src="/media/clinic-reel.mp4"
            autoPlay
            controls
            loop
            aria-label="Hygiene treatment preview"
            className="size-full object-cover"
          />
          <Button
            type="button"
            variant="light"
            size="icon"
            onClick={() => setIsPlaying(false)}
            aria-label="Close hygiene treatment preview video"
            className="absolute top-4 right-4 z-20"
          >
            <X aria-hidden className="size-4" />
          </Button>
        </div>
      ) : (
        <>
          <Media
            src="/images/generated/oral-hygiene-showcase.jpg"
            alt="Professional dental hygiene scaling and polishing instruments arranged in warm studio light"
            ratio="4 / 3"
            tone="sand"
            className="rounded-none"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play hygiene treatment preview video"
              className="grid size-20 place-items-center rounded-full bg-white text-black shadow-card t-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function OralHygieneShowcase() {
  return (
    <Steps
      title="Hygiene Treatment"
      accent="in Action"
      action={<BookButton>Book Now</BookButton>}
      steps={DEMOS}
      media={<Walkthrough />}
    />
  );
}
