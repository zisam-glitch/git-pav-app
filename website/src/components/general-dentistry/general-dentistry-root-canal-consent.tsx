import { useState } from "react";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

export function GeneralDentistryRootCanalConsent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-tile-sage rounded-[1.5rem] border border-black/6 px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Consent &amp; guidance
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Informed consent for{" "}
                <span className="text-[#754B3D]">root canal treatment</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Before proceeding with root canal treatment, we ensure you fully understand the
                procedure, risks, and benefits of saving your natural tooth.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-black/6 bg-white p-3 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
                <div className="relative aspect-video overflow-hidden rounded-[1.1rem] sm:aspect-[21/9]">
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
                        aria-label="Close root canal consent overview"
                        onClick={() => setIsPlaying(false)}
                        className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src="https://res.cloudinary.com/db1i46uiv/image/upload/v1724354058/istockphoto-1336830204-640x640_grta45.jpg"
                        alt="Root canal treatment consent overview"
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="flex size-16 items-center justify-center rounded-full bg-black text-white shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#1B3745] sm:size-20"
                          aria-label="Play root canal consent overview"
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
