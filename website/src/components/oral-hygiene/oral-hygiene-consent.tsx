import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Play, X } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const CONSENT_PARTS = [
  {
    title: "Informed Consent — Gum Disease Part 1",
    desc: "Understanding how plaque, tartar, and gum inflammation develop and what hygiene treatment involves.",
    icon: FileText,
  },
  {
    title: "Informed Consent — Gum Disease Part 2",
    desc: "Reviewing potential risks, benefits, temporary sensitivity, and alternative care pathways.",
    icon: AlertCircle,
  },
  {
    title: "Informed Consent — Gum Disease Part 3",
    desc: "Confirming your questions are answered and your consent is completely voluntary.",
    icon: CheckCircle2,
  },
];

export function OralHygieneConsent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Informed consent
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Oral hygiene &amp;{" "}
                <span className="text-[#ECD880]">gum care advice</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Before any treatment begins, we walk through gum disease consent in clear steps so
                you understand the procedure, expected outcomes, and home aftercare.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
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
                        onClick={() => setIsPlaying(false)}
                        aria-label="Close video"
                        className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src="/media/hims/suite-editorial.jpg"
                        alt="Dental hygiene consultation and consent process"
                        className="size-full object-cover opacity-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745]/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="flex size-16 items-center justify-center rounded-full bg-[#ECD880] text-[#1B3745] shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#FDEAA0] sm:size-20"
                          aria-label="Play informed consent overview"
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
              {CONSENT_PARTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/12 bg-white/6 p-6"
                >
                  <item.icon className="size-5 text-[#ECD880]" />
                  <h3 className="mt-4 font-display text-lg font-normal tracking-[-0.02em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
