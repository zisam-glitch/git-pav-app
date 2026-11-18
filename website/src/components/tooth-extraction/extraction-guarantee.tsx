import React from "react";
import { CheckCircle, Shield, Clock3, HeartPulse } from "lucide-react";

const PERKS = [
  {
    icon: Clock3,
    title: "Same-Day Treatment",
    desc: "Emergency slots reserved every day — call in the morning and be seen the same afternoon.",
  },
  {
    icon: Shield,
    title: "Pain-Free Promise",
    desc: "Advanced local anaesthetic and sedation options ensure you feel only comfort throughout.",
  },
  {
    icon: HeartPulse,
    title: "Post-Operative Care",
    desc: "Every patient gets a full aftercare pack and 24-hour direct line to our clinical team.",
  },
  {
    icon: CheckCircle,
    title: "All Extractions Covered",
    desc: "From routine extractions to complex impacted wisdom teeth — handled in a single visit.",
  },
];

export function ExtractionGuarantee() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left — text */}
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Guaranteed Same-Day Treatment
            </h2>
            <p className="mt-5 text-[#6b5848] leading-relaxed max-w-lg text-sm sm:text-base">
              Dental pain is never something you should endure. At Pav Dental,
              we've built our extraction service around immediate, affordable and
              lasting relief — assessed, planned and treated in one appointment.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "No waiting lists — same-day emergency access",
                "Local anaesthetic or sedation for anxious patients",
                "Digital X-ray assessment before every extraction",
                "Antibiotic and pain relief prescription included",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#2a1c12]">
                  <CheckCircle className="size-4 text-primary mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — solid feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PERKS.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-xl p-6 flex flex-col gap-4   shadow-sm"
              >
                <p.icon className="size-5 text-[#925a27]" />
                <div>
                  <p className="font-bold text-[#2a1c12] text-sm">{p.title}</p>
                  <p className="text-xs text-[#6b5848] mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
