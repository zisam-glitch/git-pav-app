import React from "react";

const SERVICES = [
  {
    title: "Preventative Care",
    desc: "General dentistry aims to prevent oral health problems before they become severe. This includes advice on proper brushing techniques, flossing, and diet.",
  },
  {
    title: "Gum Disease Treatment",
    desc: "Treatment for gum diseases like gingivitis and periodontitis is another crucial aspect of general dentistry.",
  },
  {
    title: "Dental Crowns and Bridges",
    desc: "These are used to restore and replace damaged or missing teeth, improving the function and appearance of your smile.",
  },
  {
    title: "Regular Check-ups",
    desc: "Routine dental check-ups are essential for maintaining good oral health. These appointments typically include a dental cleaning, X-rays, and an examination by the dentist.",
  },
  {
    title: "Dental Fillings",
    desc: "Dental fillings are used to restore teeth damaged by decay back to their normal function and shape.",
  },
  {
    title: "Tooth Extractions",
    desc: "Sometimes a tooth may need to be removed due to decay, disease, or crowding. General dentists can perform simple extractions.",
  },
];

export function GeneralDentistryServices() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Services Offered in General Dentistry
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Comprehensive dental care services designed to maintain and improve your oral health for the entire family.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8  ">
          {SERVICES.map((service, i) => (
            <div key={service.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}