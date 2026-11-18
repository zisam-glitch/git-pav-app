import { Reveal } from "@/components/home/reveal";

const BENEFITS = [
  {
    title: "Prevent Gum Disease",
    desc: "Regular professional cleaning removes plaque and tartar before gingivitis and periodontal issues progress.",
  },
  {
    title: "Stop Bleeding & Swollen Gums",
    desc: "Targeted scaling calms gum inflammation early to protect delicate gum tissue.",
  },
  {
    title: "Reduce Bad Breath",
    desc: "Removing bacteria and deposits from around teeth and gums helps keep your breath fresher.",
  },
  {
    title: "Remove Plaque & Hard Tartar",
    desc: "Professional hygiene removes hardened tartar that daily brushing and flossing cannot clear alone.",
  },
  {
    title: "Improve Overall Health",
    desc: "Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks, and infections.",
  },
  {
    title: "Protect Dental Work",
    desc: "Regular hygiene care safeguards crowns, veneers, bridges, and implants for the long term.",
  },
];

export function OralHygieneImportance() {
  return (
    <section id="importance" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Why it matters
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Why your oral hygiene{" "}
                <span className="text-[#754B3D]">matters</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Good hygiene care helps keep both your smile and your wider health protected.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-black/6 bg-white p-6 sm:p-7">
                    <span className="font-mono text-xs font-medium text-[#754B3D]">0{i + 1}</span>
                    <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
