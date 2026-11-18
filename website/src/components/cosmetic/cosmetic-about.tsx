import React, { useState } from "react";
import { Play, X, Camera, Scan, Check } from "lucide-react";

const STEPS = [
  {
    icon: Scan,
    title: "Digital 3D Smile Scan",
    desc: "Precision intraoral 3D scans capture your exact tooth dimensions, bite mechanics, and facial proportions.",
  },
  {
    icon: Camera,
    title: "Trial Smile Simulation",
    desc: "Review a physical mock-up directly in your mouth so you can test and approve your new look before any work begins.",
  },
  {
    icon: Check,
    title: "Precision Ceramic Bonding",
    desc: "Master ceramists custom-layer multi-translucent porcelain, bonded with micron-level margin accuracy.",
  },
];

export function CosmeticAbout() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12] border-b border-[#3d2a1d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Understanding Cosmetic Dentistry &amp; Smile Design
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            Cosmetic dentistry focuses on aesthetic harmony, symmetry, and natural luminosity. We combine digital dentistry with artisan craftsmanship for balanced, life-changing smiles.
          </p>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden border border-[#523825] shadow-xl">
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
                  aria-label="Close cosmetic procedure showcase"
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <img
                  src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=85"
                  alt="Precision sculpted porcelain veneer bonding"
                  className="size-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Lower-third */}
                

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#cf9448] text-[#1a1a1a] shadow-xl hover:scale-110 hover:bg-[#c2873d] transition-all duration-300"
                    aria-label="Play cosmetic procedure showcase"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#cf9448] animate-ping opacity-20" />
                    <Play className="size-8 sm:size-10 fill-current translate-x-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3 Step Cards */}
      
      </div>
    </section>
  );
}
