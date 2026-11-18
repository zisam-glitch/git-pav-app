import { useState } from "react";
import { Play, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const DEMOS = [
  {
    id: "scale-polish",
    title: "Professional Scale & Polish Procedure",
    desc: "See how our clinician gently removes plaque and tartar from above and below the gumline before polishing.",
    thumbnail:
      "/media/hims/suite-editorial.jpg",
    tag: "Hygiene Treatment",
  },
  {
    id: "gum-treatment",
    title: "Oral Hygiene & Gum Care Advice",
    desc: "Practical techniques for brushing, interdental cleaning, and preventing bleeding gums between clinic visits.",
    thumbnail:
      "/media/hims/bento-checkup.jpg",
    tag: "Gum Care Advice",
  },
];

export function OralHygieneShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-tile-warm rounded-[1.5rem] border border-black/6 px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Clinical care
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Hygiene procedures{" "}
                <span className="text-[#754B3D]">in action</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Watch how our gentle hygiene treatments and gum care education keep your smile
                healthy.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {DEMOS.map((demo) => {
                const isPlaying = activeVideo === demo.id;
                return (
                  <div
                    key={demo.id}
                    className="flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/10">
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
                            onClick={() => setActiveVideo(null)}
                            aria-label="Close video"
                            className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={demo.thumbnail}
                            alt={demo.title}
                            className="size-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
                          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#1B3745]">
                            {demo.tag}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setActiveVideo(demo.id)}
                              className="flex size-16 items-center justify-center rounded-full bg-black text-white shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#1B3745]"
                              aria-label={`Play ${demo.title}`}
                            >
                              <Play className="size-6 translate-x-0.5 fill-current" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black sm:text-2xl">
                        {demo.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-black/65">{demo.desc}</p>
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
