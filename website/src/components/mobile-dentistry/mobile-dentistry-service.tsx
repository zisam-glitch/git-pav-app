import React from "react";

export function MobileDentistryService() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight mb-6">
              We Come to You
            </h2>
            <p className="text-[#6b5848] text-sm sm:text-base leading-relaxed mb-6">
              We have a modern, well-equipped mobile surgery that allows us to visit you in the comfort of your own home. Our state-of-the-art mobile dental unit brings comprehensive dental services directly to your doorstep.
            </p>
            <p className="text-[#6b5848] text-sm sm:text-base leading-relaxed">
              With many combined years of dental experience in both traditional and mobile dentistry, along with the latest technology and equipment, we guarantee our patients the utmost satisfactory service.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=85"
              alt="Mobile dental surgery"
              className="rounded-xl shadow-lg w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#925a27] text-white p-6 rounded-xl shadow-lg max-w-xs">
              <p className="font-display text-lg font-bold mb-2">Mobile Surgery</p>
              <p className="text-sm opacity-90">Fully equipped for comprehensive dental care</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}