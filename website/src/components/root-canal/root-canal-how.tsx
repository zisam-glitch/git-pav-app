import { Play, X } from "lucide-react";
import { useState } from "react";
import { BookButton, Media } from "@/components/hims";
import { Steps, type Step } from "@/components/hims/steps";
import { Button } from "@/components/ui/button";

const PROCEDURE_STEPS: readonly Step[] = [
  {
    title: "Local Anaesthesia & Access",
    body: "The area is gently numbed for comfort before accessing the damaged or infected tooth pulp.",
  },
  {
    title: "Canal Cleaning & Shaping",
    body: "Infected pulp is removed and the root canals are carefully cleaned, disinfected, and shaped.",
  },
  {
    title: "Biocompatible Seal & Restoration",
    body: "Canals are sealed with a biocompatible material to prevent reinfection and protect your natural tooth.",
  },
];

/** The walkthrough picture; a click swaps it for the clinic video (a feature, kept from the first pass). */
function Walkthrough() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl bg-brown">
      {isPlaying ? (
        <div className="relative aspect-[4/3]">
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
        <>
          <Media
            src="/images/generated/root-canal-how.jpg"
            alt="Pav Dental clinical room prepared for root canal treatment"
            ratio="4 / 3"
            tone="brown"
            className="rounded-none"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/25 p-6 text-center">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="grid size-20 place-items-center rounded-full bg-white text-black shadow-card t-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:size-24"
              aria-label="Play root canal walkthrough video"
            >
              <Play aria-hidden className="size-8 translate-x-0.5 fill-current sm:size-9" />
            </button>
            <p className="rounded-pill bg-black/60 px-4 py-2 text-label text-white">
              Watch treatment walkthrough
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function RootCanalHow() {
  return (
    <Steps
      title="How the Root canal treatment"
      accent="is done."
      action={<BookButton>Book Now</BookButton>}
      steps={PROCEDURE_STEPS}
      media={<Walkthrough />}
    />
  );
}
