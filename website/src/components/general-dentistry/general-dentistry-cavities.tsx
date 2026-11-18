import { useState } from "react";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

export function GeneralDentistryCavities() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Patient education
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                How do dental{" "}
                <span className="text-[#ECD880]">cavities form?</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Understanding how decay develops helps you protect your enamel and catch early
                changes before more complex care is needed.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/12 bg-black/25">
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
                        aria-label="Close cavity formation explanation"
                        onClick={() => setIsPlaying(false)}
                        className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src="https://res.cloudinary.com/db1i46uiv/image/upload/v1741885974/vlcsnap-2025-03-13-23h11m22s013_tfjkw1.png"
                        alt="How dental cavities form - visual diagram showing the decay process"
                        className="size-full object-cover opacity-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="flex size-16 items-center justify-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0] sm:size-20"
                          aria-label="Play cavity formation explanation"
                        >
                          <Play className="size-7 translate-x-0.5 fill-current" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
