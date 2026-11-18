import React, { useState } from "react";
import { Play, X } from "lucide-react";

const DEMOS = [
  {
    id: "flexible",
    title: "Flexible Valplast® Resin Adaptation",
    desc: "Demonstrating the biocompatible flexibility of modern nylon bases that gently lock into place without uncomfortable metal clasps.",
    thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=85",
    tag: "Flexible Base",
  },
  {
    id: "anatomical",
    title: "3D Bite Alignment & Occlusal Setup",
    desc: "Anatomical tooth arrangement replicating natural jaw motion, ensuring balanced chewing pressure and stable suction retention.",
    thumbnail: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=85",
    tag: "Anatomical Setup",
  },
];

export function DenturesShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12] text-white  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            Dentures Craftsmanship
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            See how modern materials and precision engineering produce lightweight, comfortable, and lifelike prosthetics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DEMOS.map((demo) => {
            const isPlaying = activeVideo === demo.id;
            return (
              <div
                key={demo.id}
                className="rounded-xl overflow-hidden bg-[#372418]   shadow-sm flex flex-col justify-between"
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

                      {/* Tag */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center bg-[#925a27] px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase text-white">
                          {demo.tag}
                        </span>
                      </div>

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
