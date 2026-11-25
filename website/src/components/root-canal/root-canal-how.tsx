import { Play, X } from "lucide-react";
import { useState } from "react";
import { Section, StepsPanel } from "@/components/hims";
import { Button } from "@/components/ui/button";

const PROCEDURE_STEPS = [
  {
    id: "numb-access",
    title: "Local Anaesthesia & Access",
    desc: "The area is gently numbed for comfort before accessing the damaged or infected tooth pulp.",
  },
  {
    id: "clean-shape",
    title: "Canal Cleaning & Shaping",
    desc: "Infected pulp is removed and the root canals are carefully cleaned, disinfected, and shaped.",
  },
  {
    id: "seal-restore",
    title: "Biocompatible Seal & Restoration",
    desc: "Canals are sealed with a biocompatible material to prevent reinfection and protect your natural tooth.",
  },
] as const;

const STEP_IMAGES = [
  "/images/generated/root-canal-how.jpg",
  "/images/generated/root-canal-hero.jpg",
  "/images/generated/root-canal-tooth.jpg",
];

export function RootCanalHow() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <Section theme="white" space="sm" aria-labelledby="root-canal-how-heading">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2
            id="root-canal-how-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            How the Root canal treatment <span className="text-[#4a5c66]">is done.</span>
          </h2>
        </div>
        <StepsPanel
          steps={PROCEDURE_STEPS.map((s, i) => {
            const [first, ...rest] = s.title.split(" ");
            return {
              title: first,
              accent: rest.join(" "),
              text: s.desc,
              image: STEP_IMAGES[i],
              alt: "",
            };
          })}
        />
        <div className="relative mt-4 aspect-video overflow-hidden rounded-[28px] bg-black">
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
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                aria-label="Close root canal walkthrough video"
                className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-white text-black"
              >
                <X aria-hidden className="size-4" />
              </button>
            </>
          ) : (
            <>
              <img
                src="/images/generated/root-canal-how.jpg"
                alt="Pav Dental clinical room prepared for root canal treatment"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Play root canal walkthrough video"
                className="absolute inset-0 grid place-items-center bg-black/30 t-colors hover:bg-black/15"
              >
                <span className="grid size-20 place-items-center rounded-full bg-white text-black sm:size-24">
                  <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
                </span>
              </button>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
