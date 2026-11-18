import { useState } from "react";
import { Play, X } from "lucide-react";

const STAGES = [
  {
    step: "01",
    title: "Numbed & Isolated",
    desc: "The area is thoroughly numbed with local anaesthesia so you remain comfortable throughout the procedure.",
  },
  {
    step: "02",
    title: "Pulp Removal",
    desc: "Infected or inflamed pulp inside the tooth is gently removed to relieve pressure and stop infection.",
  },
  {
    step: "03",
    title: "Cleaning & Shaping",
    desc: "Root canals are carefully cleaned, disinfected, and shaped to prepare for a lasting internal seal.",
  },
  {
    step: "04",
    title: "Sealing & Restoration",
    desc: "Canals are filled with biocompatible material and sealed, with a protective crown recommended where needed.",
  },
];

export function RootCanalHow() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Step-by-step procedure
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                How the root canal treatment is done
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                Modern root canal treatments are designed for comfort — removing infected pulp,
                cleaning the canals, and sealing your natural tooth for long-term protection.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 shadow-2xl">
              <div className="relative aspect-video sm:aspect-[21/9]">
                {isPlaying ? (
                  <div className="relative size-full">
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
                      className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-black/75 text-white hover:bg-black"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src="/media/hims/suite-editorial.jpg"
                      alt="Dental root canal treatment walkthrough"
                      className="size-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/85 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="grid size-20 place-items-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0]"
                        aria-label="Play root canal walkthrough video"
                      >
                        <Play className="size-8 translate-x-0.5 fill-current" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAGES.map((stage) => (
                <div
                  key={stage.step}
                  className="rounded-[1.5rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#ECD880] text-xs font-medium text-[#1B3745]">
                    {stage.step}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
