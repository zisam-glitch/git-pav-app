import React from "react";

const BENEFITS = [
  {
    title: "Strong protection for sports",
    desc: "Designed to withstand high-impact activities and protect your teeth during sports.",
  },
  {
    title: "Comfortable fit that stays secure",
    desc: "Custom-made to fit your teeth perfectly for maximum comfort and security.",
  },
  {
    title: "Digital or mould kit options",
    desc: "Choose between precise digital scans at our clinic or convenient home mould kits.",
  },
  {
    title: "NHS partners",
    desc: "We work with NHS to provide accessible dental protection for eligible patients.",
  },
  {
    title: "High quality materials",
    desc: "Only the best materials used to ensure durability and long-lasting protection.",
  },
  {
    title: "Fast turnaround",
    desc: "Quick manufacturing and delivery to get you protected as soon as possible.",
  },
  {
    title: "Trusted Bradford based clinic",
    desc: "Local expertise you can trust with years of experience in custom mouthguards.",
  },
];

export function MouthguardsWhyChoose() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Why Choose Pav Dental Mouthguards?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Every mouthguard is created using precise digital or physical impressions with full control over colour, style and custom features.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8  ">
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