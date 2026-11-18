import React from "react";

const BENEFITS = [
  {
    title: "Prevent Gum Disease",
    desc: "Regular professional cleaning removes plaque and tartar that cause gingivitis and periodontal disease.",
  },
  {
    title: "Stop Bleeding & Swollen Gums",
    desc: "Treat inflammation early to prevent gum recession and maintain healthy gum tissue.",
  },
  {
    title: "Reduce Bad Breath",
    desc: "Professional cleaning removes bacteria and food particles that cause persistent bad breath.",
  },
  {
    title: "Remove Plaque & Hard Tartar",
    desc: "Scale and polish treatments remove buildup that brushing alone cannot eliminate.",
  },
  {
    title: "Improve Overall Health",
    desc: "Good oral health is linked to better heart health, diabetes management, and reduced infection risks.",
  },
  {
    title: "Protect Dental Work",
    desc: "Regular hygiene care extends the life of crowns, implants, bridges, and other dental restorations.",
  },
];

export function OralHygieneImportance() {
  return (
    <section id="importance" className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Why Your Oral Hygiene Matters
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Good hygiene care helps to maintain optimal oral health and protect your overall wellbeing. Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks, and infections.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8  ">
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