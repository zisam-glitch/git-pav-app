import { useState } from "react";
import { Camera, Check, Play, Scan, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const STEPS = [
  {
    icon: Scan,
    title: "Digital 3D Smile Scan",
    desc: "Intraoral scanning captures your tooth dimensions, bite mechanics, and facial proportions.",
  },
  {
    icon: Camera,
    title: "Considered Smile Planning",
    desc: "Review shape, shade, and symmetry options with your dentist before treatment begins.",
  },
  {
    icon: Check,
    title: "Precision Restorative Craft",
    desc: "Tailored porcelain, resin, or whitening care designed to look natural and feel comfortable.",
  },
];

export function CosmeticAbout() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                What is Cosmetic Dentistry?
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Where clinical precision meets{" "}
                <span className="text-[#ECD880]">natural aesthetics</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Cosmetic Dentistry refers to dental work that improves the appearance of teeth,
                gums, and/or bite. It primarily focuses on improvement in dental aesthetics such as
                color, position, shape, size, and overall smile appearance.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/12 bg-black/20">
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
                        aria-label="Close cosmetic procedure showcase"
                        onClick={() => setIsPlaying(false)}
                        className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src="/media/hims/suite-editorial.jpg"
                        alt="Cosmetic smile design consultation"
                        className="size-full object-cover opacity-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="flex size-16 items-center justify-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0] sm:size-20"
                          aria-label="Play cosmetic procedure showcase"
                        >
                          <Play className="size-7 translate-x-0.5 fill-current" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[1.5rem] border border-white/12 bg-white/6 p-6"
                >
                  <step.icon className="size-5 text-[#ECD880]" />
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
