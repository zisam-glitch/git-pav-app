import React from "react";

const CHOOSING_FACTORS = [
  {
    title: "Qualifications",
    desc: "Make sure the dentist is board-certified and has good reviews from current patients.",
  },
  {
    title: "Location",
    desc: "A conveniently located clinic will make regular visits easier and more consistent.",
  },
  {
    title: "Services Offered",
    desc: "Ensure that the dental office offers the range of services you and your family may need.",
  },
  {
    title: "Insurance",
    desc: "Check if the dental practice accepts your insurance and offers flexible payment options.",
  },
];

export function GeneralDentistryChoosing() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            How to Choose a General Dentist
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Finding the right dentist is important for your long-term oral health. Consider these key factors when making your choice.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {CHOOSING_FACTORS.map((factor, i) => (
            <div key={factor.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {factor.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {factor.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}