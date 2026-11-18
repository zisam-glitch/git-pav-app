import React, { useState } from "react";
import { Play, X } from "lucide-react";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-16 text-white sm:px-10 sm:py-24">
          <div className="mx-auto max-w-[87rem]">
            {/* Header */}
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Inside the clinic
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                What causes cavities?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                Walk the treatment suite — ice lighting, still instruments, no rush. This is the space we hold for emergency and private care, 24 hours a day.
              </p>
            </div>

            {/* Video Player */}
            <div className="overflow-hidden rounded-[1.5rem] border border-white/12 shadow-2xl">
              <div className="group relative aspect-video bg-[#1B3745] sm:aspect-[21/9]">
                {isPlaying ? (
                  <div className="relative size-full">
                    <iframe
                      title="Pav Dental clinic tour"
                      src="https://www.youtube.com/embed/zHXljj727OE?si=Uz7mq8eE5tSAvpgy&autoplay=1&controls=0&loop=1&playlist=zHXljj727OE&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3"
                      className="size-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      type="button"
                      onClick={() => setIsPlaying(false)}
                      aria-label="Close video"
                      className="absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src="/media/thumbnails/1.jpg"
                      alt="Modern dental clinic treatment room"
                      className="size-full object-cover object-center opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/80 via-black/20 to-transparent" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="relative flex size-20 items-center justify-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#FDEAA0] sm:size-24"
                        aria-label="Play clinic tour video"
                      >
                        <span className="absolute inset-0 animate-ping rounded-full bg-[#ECD880] opacity-20" />
                        <Play className="size-8 translate-x-0.5 fill-current sm:size-10" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
