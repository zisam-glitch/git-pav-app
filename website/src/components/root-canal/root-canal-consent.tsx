import React, { useState } from "react";
import { Play, X, ShieldAlert, CheckCircle } from "lucide-react";

export function RootCanalConsent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12] text-white  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Informed Consent for Root Canal Treatment
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            We ensure you have complete clarity on why the procedure is recommended, realistic success probabilities, and the vital role of a protective crown following therapy.
          </p>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden   shadow-xl">
          <div className="relative aspect-video sm:aspect-[21/9] bg-[#2a1c12] group">
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
                  className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <img
                  src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=85"
                  alt="Restored teeth and healthy gums following root canal"
                  className="size-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Lower-third */}
             

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#cf9448] text-[#1a1a1a] shadow-xl hover:scale-110 hover:bg-[#d8a258] transition-all duration-300"
                    aria-label="Play informed consent video"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#cf9448] animate-ping opacity-20" />
                    <Play className="size-8 sm:size-10 fill-current translate-x-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3 Key Consent Pillars */}
     
      </div>
    </section>
  );
}
