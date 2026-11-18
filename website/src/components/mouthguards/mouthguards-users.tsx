import React from "react";

const USER_TYPES = [
  {
    title: "Rugby Players",
    desc: "Shields teeth and gums during high-contact tackles and scrums.",
  },
  {
    title: "Hockey Players",
    desc: "Protects against sticks, pucks, and high-speed on-ice collisions.",
  },
  {
    title: "Boxers",
    desc: "Minimizes jaw impact and prevents oral injuries during intense boxing sessions.",
  },
  {
    title: "Athletes",
    desc: "Provides strong impact protection during training and competitive sports.",
  },
  {
    title: "Adults",
    desc: "For everyday protection against grinding, clenching, or accidental impact.",
  },
  {
    title: "Children",
    desc: "Keeps growing teeth safe during play, sports, and daily activities.",
  },
  {
    title: "Anyone Needing Extra Protection",
    desc: "Ideal for anyone who grinds teeth, plays sports, or needs added oral safety.",
  },
];

export function MouthguardsUsers() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Who Can Use Our Mouthguards
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Our custom mouthguards are designed for everyone - from professional athletes to children needing everyday protection.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8  ">
          {USER_TYPES.map((user, i) => (
            <div key={user.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {user.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {user.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}