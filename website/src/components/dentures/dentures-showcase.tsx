import { useState } from "react";
import { Play, X } from "lucide-react";

const DEMOS = [
  {
    id: "flexible",
    title: "Premium — Flexible Denture",
    desc: "Demonstrating the biocompatible flexibility of Valplast nylon bases that adapt comfortably without rigid metal clasps.",
    thumbnail:
      "/media/hims/suite-editorial.jpg",
    tag: "Flexible Valplast",
  },
  {
    id: "intermediate",
    title: "Intermediate — Acrylic With Clasps",
    desc: "Anatomical tooth arrangement with discreet retention clasps, balanced chewing pressure, and natural gum shading.",
    thumbnail:
      "/media/hims/card-emergency.jpg",
    tag: "Acrylic With Clasps",
  },
];

export function DenturesShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Craftsmanship
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Dentures crafted for comfort and aesthetics
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                See how modern materials and precision scanning produce lightweight, lifelike
                dentures tailored to your mouth.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {DEMOS.map((demo) => {
                const isPlaying = activeVideo === demo.id;
                return (
                  <div
                    key={demo.id}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/8 backdrop-blur-sm"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/30">
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
                            className="absolute top-4 right-4 z-20 grid size-9 place-items-center rounded-full bg-black/75 text-white hover:bg-black"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/80 via-transparent to-black/20" />
                          <span className="absolute top-4 left-4 rounded-full bg-[#ECD880] px-3 py-1 text-[11px] font-medium text-[#1B3745]">
                            {demo.tag}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setActiveVideo(demo.id)}
                              className="grid size-16 place-items-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0]"
                              aria-label={`Play ${demo.title}`}
                            >
                              <Play className="size-6 translate-x-0.5 fill-current" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-6 sm:p-7">
                      <h3 className="font-display text-2xl font-normal tracking-[-0.02em] text-white">
                        {demo.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">{demo.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
