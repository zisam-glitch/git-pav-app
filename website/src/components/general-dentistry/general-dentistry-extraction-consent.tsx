import React, { useState } from "react";
import { Play, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

const CONSENT_ITEMS = [
  {
    title: "Treatment Understanding",
    desc: "I understand the nature of the tooth extraction procedure, including the removal process and expected recovery time.",
    icon: FileText,
  },
  {
    title: "Risks and Benefits",
    desc: "I have been informed of the potential risks and benefits, including possible bleeding, infection, and alternatives to extraction.",
    icon: AlertCircle,
  },
  {
    title: "Voluntary Participation",
    desc: "I understand that my participation in this treatment is voluntary and I may withdraw consent at any time.",
    icon: CheckCircle2,
  },
];

export function GeneralDentistryExtractionConsent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Informed Consent for Tooth Extraction
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            Before proceeding with tooth extraction, we ensure you fully understand the procedure, risks, and benefits of removing your tooth.
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
                  aria-label="Close tooth extraction consent overview"
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <img
                  src="https://res.cloudinary.com/db1i46uiv/image/upload/v1724354135/10_hfaljq.webp"
                  alt="Tooth extraction consent overview"
                  className="size-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#cf9448] text-[#1a1a1a] shadow-xl hover:scale-110 hover:bg-[#c2873d] transition-all duration-300"
                    aria-label="Play tooth extraction consent overview"
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