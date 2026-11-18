import React from "react";

const INDICATORS = [
  {
    title: "Bleeding Gums",
    desc: "Gums that bleed during brushing or flossing indicate inflammation and early gum disease.",
  },
  {
    title: "Bad Breath",
    desc: "Persistent bad breath that doesn't improve with brushing may indicate gum infection or decay.",
  },
  {
    title: "Gum Swelling or Tenderness",
    desc: "Red, swollen, or tender gums are signs of gingivitis that require professional treatment.",
  },
  {
    title: "Stains on Teeth",
    desc: "Surface stains from coffee, tea, or smoking can be professionally removed for a brighter smile.",
  },
  {
    title: "Loose Teeth",
    desc: "Teeth that feel loose or shifting may indicate advanced gum disease requiring immediate care.",
  },
  {
    title: "Sensitive Gums",
    desc: "Gum sensitivity to hot, cold, or sweet foods can indicate recession or enamel issues.",
  },
  {
    title: "Diabetes or Medical Conditions",
    desc: "Certain medical conditions affect healing and increase risk of gum disease, requiring extra care.",
  },
  {
    title: "Dental Work",
    desc: "Essential care if you wear braces, dentures, crowns, veneers, bridges, or implants.",
  },
];

export function OralHygieneWhoNeeds() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Who Needs Hygiene Treatment?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            You may need to see our hygienist if you experience any of these signs or have specific dental needs. Regular hygiene appointments are also essential if you wear braces, dentures, crowns, veneers, bridges, or implants.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {INDICATORS.map((item, i) => (
            <div key={item.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}