import React, { useState } from "react";
import { Play, X } from "lucide-react";

const DEMOS = [
  {
    id: "root-canal",
    title: "Root Canal Treatment Procedure",
    desc: "Watch our detailed explanation of the root canal treatment process, from diagnosis to completion.",
    thumbnail: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=85",
    tag: "Endodontic Treatment",
  },
  {
    id: "filling",
    title: "White Filling Procedure",
    desc: "See how composite fillings are placed to restore teeth damaged by decay with natural-looking results.",
    thumbnail: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=85",
    tag: "Restorative Care",
  },
];

export function GeneralDentistryShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12] text-white border-b border-[#3d2a1d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            Procedures in Action
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            Experience the precision and care that goes into our general dentistry procedures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DEMOS.map((demo) => {
            const isPlaying = activeVideo === demo.id;
            return (
              <div
                key={demo.id}
                className="rounded-xl overflow-hidden bg-[#372418] border border-[#523825] shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-[#2a1c12] overflow-hidden">
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
                        aria-label={`Close ${demo.title}`}
                        onClick={() => setActiveVideo(null)}
                        className="absolute top-4 right-4 z-20 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={demo.thumbnail}
                        alt={demo.title}
                        className="size-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(demo.id)}
                          className="size-16 rounded-full bg-[#cf9448] text-[#1a1a1a] flex items-center justify-center shadow-xl hover:scale-110 hover:bg-[#c2873d] transition-transform"
                          aria-label={`Play ${demo.title}`}
                        >
                          <Play className="size-7 fill-current translate-x-0.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white">
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
                    {demo.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}