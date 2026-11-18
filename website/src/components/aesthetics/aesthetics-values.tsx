import React from "react";

const VALUES = [
  {
    title: "Expert Medical Guidance",
    desc: "Every journey begins with a thorough 45-minute medical consultation. We listen attentively to your goals and map treatments strictly to your natural bone and muscle structure.",
  },
  {
    title: "Subtle Natural Results",
    desc: "Our clinical philosophy is grounded in restraint. We strive for imperceptible enhancements that leave you looking well-rested, radiant, and refreshed — never overfilled or expressionless.",
  },
  {
    title: "Dedicated Follow-Up Care",
    desc: "We stand with you throughout your recovery. Every injectable treatment includes an automatic 14-day review, direct contact with your clinician, and dedicated aftercare guidance.",
  },
];

export function AestheticsValues() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Our Clinical Values &amp; Ethics
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            We operate with the integrity of healthcare professionals rather than the sales pressure of beauty salons.
          </p>
        </div>

        {/* Minimal editorial grid — no card boxes, no shadows */}
        <div className="grid sm:grid-cols-3 gap-8 pt-8  ">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
