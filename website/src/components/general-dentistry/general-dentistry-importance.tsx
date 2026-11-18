import React from "react";

const IMPORTANCE_POINTS = [
  {
    title: "Early Diagnosis",
    desc: "Regular dental visits help in early detection of oral health problems like cavities and gum disease.",
  },
  {
    title: "Prevention",
    desc: "General dentistry focuses on preventative care, which can save you from more extensive and expensive treatments down the line.",
  },
  {
    title: "Education",
    desc: "Dentists not only treat but also educate patients on the best practices for oral care.",
  },
  {
    title: "Family Care",
    desc: "General dentistry caters to the dental needs of the entire family, from children to seniors.",
  },
];

export function GeneralDentistryImportance() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Why General Dentistry is Important?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            General dentistry forms the foundation of good oral health, providing essential care that prevents problems before they start and ensures your smile stays healthy for life.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {IMPORTANCE_POINTS.map((point, i) => (
            <div key={point.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {point.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}