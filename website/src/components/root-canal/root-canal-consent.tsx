import { useState } from "react";
import { Check, Play, X } from "lucide-react";

const PILLARS = [
  {
    title: "Why Treatment Is Needed",
    desc: "Your clinician explains signs of pulp infection or inflammation and reviews alternative options such as extraction.",
  },
  {
    title: "Risks & Realistic Expectations",
    desc: "Informed discussion covers potential risks such as persistent infection, missed canals, or the possible need for retreatment.",
  },
  {
    title: "Post-Treatment Crown Advice",
    desc: "For back teeth or teeth with significant damage, a protective crown is discussed to restore strength and prevent fractures.",
  },
];

export function RootCanalConsent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Patient clarity
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Informed Consent for{" "}
                <span className="text-[#754B3D]">Root Canal Treatment</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                We ensure you have complete clarity on why the procedure is recommended,
                expected recovery, and the protective restoration your tooth needs afterward.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-black/6 bg-white shadow-[0_10px_32px_rgba(0,0,0,0.06)]">
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
                      src="/media/hims/card-emergency.jpg"
                      alt="Restored teeth and healthy gums following root canal"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="grid size-20 place-items-center rounded-full bg-black text-white shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#1B3745]"
                        aria-label="Play informed consent video"
                      >
                        <Play className="size-8 translate-x-0.5 fill-current" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="hims-tile-warm rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-black text-white">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-black">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/65">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
