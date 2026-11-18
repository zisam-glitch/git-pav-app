import React, { useState } from "react";
import { Play, X } from "lucide-react";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video" className="py-20 sm:py-28 bg-[#2a1c12]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            What causes cavities?
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            Walk the treatment suite — ice lighting, still instruments, no rush. This is the space we hold for emergency and private care, 24 hours a day.
          </p>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden   shadow-xl">
          <div className="relative aspect-video sm:aspect-[21/9] bg-[#2a1c12] group">
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
                  className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <img
                  src="/media/thumbnails/1.jpg"
                  alt="Modern dental clinic treatment room"
                  className="size-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#cf9448] text-[#1a1a1a] shadow-xl hover:scale-110 hover:bg-[#d8a25a] transition-all duration-300"
                    aria-label="Play clinic tour video"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#cf9448] animate-ping opacity-20" />
                    <Play className="size-8 sm:size-10 fill-current translate-x-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
