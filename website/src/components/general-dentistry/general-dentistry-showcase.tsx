import { useState } from "react";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const DEMOS = [
  {
    id: "root-canal",
    title: "Root Canal Treatment Procedure",
    desc: "Watch our explanation of the root canal treatment process, from diagnosis to sealing the tooth.",
    thumbnail:
      "/media/hims/suite-editorial.jpg",
    tag: "Endodontic Treatment",
  },
  {
    id: "filling",
    title: "White Filling Procedure",
    desc: "See how composite fillings restore teeth affected by decay with natural tooth-colored results.",
    thumbnail:
      "/media/hims/bento-checkup.jpg",
    tag: "Restorative Care",
  },
];

export function GeneralDentistryShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Procedures
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Procedures in action
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                Experience the calm precision and clinical care behind our everyday dentistry.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {DEMOS.map((demo) => {
                const isPlaying = activeVideo === demo.id;
                return (
                  <div
                    key={demo.id}
                    className="flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/6"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/25">
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
                            className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                          <span className="absolute left-4 top-4 rounded-full bg-white/18 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {demo.tag}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setActiveVideo(demo.id)}
                              className="flex size-16 items-center justify-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0]"
                              aria-label={`Play ${demo.title}`}
                            >
                              <Play className="size-7 translate-x-0.5 fill-current" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-white sm:text-2xl">
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
