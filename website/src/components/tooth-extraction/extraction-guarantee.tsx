import { Check, Clock3, HeartPulse, Shield, Sparkles } from "lucide-react";

const CHECKLIST = [
  "No waiting lists — same-day emergency access",
  "Experienced and compassionate surgical team",
  "State-of-the-art digital X-ray assessment",
  "Affordable and transparent upfront pricing",
];

const PERKS = [
  {
    icon: Clock3,
    title: "Same-Day Treatment",
    desc: "Tooth pain cannot wait. We reserve emergency slots daily so you can be seen and treated promptly.",
  },
  {
    icon: Shield,
    title: "Comfortable Anaesthetic",
    desc: "Effective local anaesthetic ensures you feel pressure rather than pain throughout your extraction.",
  },
  {
    icon: HeartPulse,
    title: "Comprehensive Aftercare",
    desc: "Clear written recovery instructions and direct access to our clinical team if questions arise.",
  },
  {
    icon: Sparkles,
    title: "Patient-Centric Approach",
    desc: "Every step is explained clearly before we begin, with informed consent and replacement options discussed.",
  },
];

export function ExtractionGuarantee() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Same-day care
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Guaranteed Tooth Extraction{" "}
                <span className="text-[#754B3D]">Same Day Treatment</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-black/65">
                We understand that tooth pain can be unbearable and waiting is not an option.
                Using modern techniques and equipment, we safely remove the affected tooth,
                alleviating your pain and preventing further complications.
              </p>

              <ul className="mt-8 divide-y divide-black/10 border-t border-b border-black/10">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-center justify-between gap-4 py-3.5 text-sm text-black/85">
                    <span>{item}</span>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-white">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PERKS.map((p, index) => (
                <div
                  key={p.title}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "hims-tile-warm"
                  } flex flex-col justify-between gap-4 rounded-[1.5rem] border border-black/6 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]`}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[#F2EDE5] text-[#1B3745]">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
