import React from "react";

const BENEFITS = [
  {
    title: "Speed and Convenience",
    desc: "With virtual dental consultations, you can access dental care from the comfort of your own home.",
  },
  {
    title: "Time Saving",
    desc: "You don't have to take time off work or school to visit a dentist in person. Our platform provides the quickest and simplest method for obtaining your dental e-prescription.",
  },
  {
    title: "Streamlined Prescription Management",
    desc: "Keep all your prescriptions organized and easily accessible in one place, enabling efficient tracking and monitoring.",
  },
  {
    title: "Enhanced Accuracy",
    desc: "E-prescriptions significantly reduce the likelihood of errors, ensuring that you receive the precise medication, proper dosage, and accurate instructions.",
  },
  {
    title: "Eco-friendly",
    desc: "Embracing paperless e-prescriptions contributes to a greener planet by minimizing paper waste and promoting eco-conscious practices.",
  },
];

export function VirtualDentistryBenefits() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Why you should choose PavDental Virtual Dentist?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Experience the future of dental care with our virtual consultation services designed for your convenience and health.
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