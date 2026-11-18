import React from "react";

const BENEFITS = [
  {
    title: "Unique mobile dental service",
    desc: "Bringing comprehensive dental care directly to your doorstep with modern equipment.",
  },
  {
    title: "Working with care homes",
    desc: "Specialized services designed for care home residents and their specific needs.",
  },
  {
    title: "CQC-compliant oral health",
    desc: "Help make your home oral-health services fully compliant with CQC standards.",
  },
  {
    title: "NHS partners",
    desc: "We work with NHS to provide accessible dental care for eligible patients.",
  },
  {
    title: "Latest mobile dental equipment",
    desc: "State-of-the-art technology and equipment for the best possible care.",
  },
  {
    title: "Hundreds of satisfied patients",
    desc: "Proven track record with many happy patients across the UK.",
  },
  {
    title: "Attract more residents",
    desc: "Quality dental services can help attract more residents to your care home.",
  },
  {
    title: "Engage carers and improve staff retention",
    desc: "Better dental care leads to improved carer engagement and staff satisfaction.",
  },
];

export function MobileDentistryBenefits() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Concerned about your residents' dental needs?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            We Are The Dentists That Come To You. Our mobile dental service brings comprehensive care to your doorstep.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {BENEFITS.map((benefit, i) => (
            <div key={benefit.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}