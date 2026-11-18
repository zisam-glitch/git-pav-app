import React from "react";

const PERSONALISATION_OPTIONS = [
  {
    title: "Name",
    desc: "Add your name for easy identification",
  },
  {
    title: "Initials",
    desc: "Personalize with your initials",
  },
  {
    title: "Team Name",
    desc: "Show your team pride",
  },
  {
    title: "Number",
    desc: "Add your player number",
  },
  {
    title: "Custom Logo",
    desc: "Add your team or club logo",
  },
];

export function MouthguardsPersonalisation() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Add Personalisation
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Personalise your mouthguard with your name, initials, team name, number, or even a custom logo if required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8  ">
          {PERSONALISATION_OPTIONS.map((option, i) => (
            <div key={option.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {option.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {option.desc}
              </p>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
}