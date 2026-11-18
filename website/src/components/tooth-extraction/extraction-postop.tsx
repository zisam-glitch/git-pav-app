import React from "react";
import { Droplets, UtensilsCrossed, BedDouble, AlertTriangle } from "lucide-react";

const INSTRUCTIONS = [
  {
    icon: Droplets,
    title: "Bleeding Management",
    color: "#b91c1c",
    steps: [
      "Bite firmly on gauze pad for 30–45 minutes",
      "Replace gauze if soaked; repeat once",
      "Avoid rinsing for the first 24 hours",
      "If bleeding persists beyond 2 hours, call us",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Eating and Drinking",
    color: "#925a27",
    steps: [
      "Wait at least 2 hours before eating",
      "Soft foods only for 24–48 hours",
      "Avoid hot drinks for the first day",
      "No straws — they dislodge the blood clot",
    ],
  },
  {
    icon: BedDouble,
    title: "Swelling",
    color: "#925a27",
    steps: [
      "Apply ice pack 20 mins on / 20 mins off for 24h",
      "Keep head elevated — extra pillow at night",
      "Some swelling is normal for 2–3 days",
      "Take prescribed anti-inflammatory as directed",
    ],
  },
];

const RED_FLAGS = [
  "Heavy bleeding not controlled by biting on gauze",
  "Severe or worsening pain after 72 hours",
  "High temperature or fever",
  "Numbness or tingling that doesn't wear off",
  "Signs of dry socket — throbbing, bad taste, visible bone",
];

export function ExtractionPostOp() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Post-Operative Instructions
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base">
            Follow these guidelines carefully for fast, complication-free
            healing after your extraction.
          </p>
        </div>

        {/* Instruction cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {INSTRUCTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl p-7 flex flex-col gap-5   shadow-sm"
            >
              <div
                className="size-11 rounded-lg flex items-center justify-center"
                style={{ background: `${section.color}22` }}
              >
                <section.icon className="size-5" style={{ color: section.color }} />
              </div>

              <div>
                <p className="font-bold text-[#2a1c12] mb-3">{section.title}</p>
                <ol className="space-y-2.5">
                  {section.steps.map((step, i) => (
                    <li key={step} className="flex gap-2.5 text-sm text-[#6b5848]">
                      <span
                        className="flex-shrink-0 size-5 rounded-md text-white flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{ background: section.color }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Red flags panel — solid dark */}
        <div className="bg-[#2a1c12] rounded-xl p-7 sm:p-10 max-w-6xl mx-auto  ">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-lg bg-red-900/40 flex items-center justify-center">
              <AlertTriangle className="size-5 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">When to Seek Urgent Help</p>
              <p className="text-xs text-white/80">
                Call us immediately or visit A&E if you experience any of the following:
              </p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {RED_FLAGS.map((flag) => (
              <li key={flag} className="flex items-start gap-2.5 text-sm text-white/75">
                <AlertTriangle className="size-4 text-red-400 flex-shrink-0 mt-0.5" />
                {flag}
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-5   flex flex-wrap gap-4 items-center">
            <div>
              <p className="text-xs text-white/80 mb-1">24h emergency line</p>
              <p className="font-display text-xl font-bold text-white">0800 1938 786</p>
            </div>
            <a
              href="/contact-us"
              className="ml-auto inline-flex items-center gap-2 rounded-full accent-gradient px-6 h-10 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Contact the Clinic
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
