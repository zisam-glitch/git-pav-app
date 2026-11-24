import { Play, X } from "lucide-react";
import { useState } from "react";
import { Media, Section, StepsPanel } from "@/components/hims";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Numb",
    accent: "the area",
    text: "The dentist numbs the area, then removes the infected pulp. Local anesthesia ensures comfort during the procedure.",
    image: "/images/generated/root-canal-hero.jpg",
    alt: "Warm sunlit Pav Dental treatment room prepared for root canal care",
  },
  {
    title: "Clean",
    accent: "and shape",
    text: "The canals are cleaned and shaped, removing infected or damaged pulp from inside the tooth. Most root canals take 45–90 minutes depending on the complexity and number of canals.",
    image: "/images/generated/root-canal-how.jpg",
    alt: "Pav Dental clinical room prepared for root canal treatment",
  },
  {
    title: "Seal",
    accent: "and protect",
    text: "The canals are filled with a biocompatible material to prevent further infection. A crown may be recommended afterward for protection.",
    image: "/images/generated/home-checkup.jpg",
    alt: "Dentist checking a patient's teeth during a check-up",
  },
];

export function RootCanalHow() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <Section theme="white" space="sm" aria-label="Root canal, built for you">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            Root canal, <span className="text-[#4a5c66]">built for you</span>
          </h2>
        </div>
        <StepsPanel steps={STEPS} />
      </Section>

      <Section id="how" theme="white" space="sm" aria-labelledby="root-canal-how-heading">
        <h2
          id="root-canal-how-heading"
          className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          How the Root canal treatment <span className="text-[#4a5c66]">is done.</span>
        </h2>
        <div className="relative mt-8 aspect-video overflow-hidden rounded-[24px] bg-[#3a2c1b]">
          {isPlaying ? (
            <>
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
            </>
          ) : (
            <>
              <Media
                src="/images/generated/root-canal-how.jpg"
                alt="Pav Dental clinical room prepared for root canal treatment"
                ratio="16 / 9"
                tone="brown"
                className="size-full rounded-none"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="grid size-20 place-items-center rounded-full bg-white text-[#2a2a2c] t-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-24"
                  aria-label="Play root canal walkthrough video"
                >
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
                </button>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
