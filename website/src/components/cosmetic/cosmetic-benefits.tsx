import React from "react";

const BENEFITS = [
  {
    title: "Enhanced Facial Harmony",
    desc: "Achieve a symmetrical, naturally luminous smile that complements your skin tone and lip line with flawless balance.",
  },
  {
    title: "Boosted Daily Confidence",
    desc: "Smile, laugh, and present with complete confidence in professional meetings, wedding photos, and everyday social settings.",
  },
  {
    title: "Restored Chewing Function",
    desc: "Repairing worn enamel and correcting minor misalignments restores comfortable chewing dynamics and clear speech.",
  },
  {
    title: "Stain-Resistant Durability",
    desc: "Modern multi-layer feldspathic and E.max ceramics resist staining from coffee, tea, and wine for long-lasting results.",
  },
];

export function CosmeticBenefits() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Benefits of Cosmetic Dentistry
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            A transformative investment in your daily confidence, dental comfort, and overall quality of life.
          </p>
        </div>

        {/* Minimal editorial grid — no card boxes, no shadows */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {BENEFITS.map((b, i) => (
            <div key={b.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
