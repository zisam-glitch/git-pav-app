import { Reveal } from "@/components/home/reveal";

const CHOOSING_FACTORS = [
  {
    title: "Qualifications",
    desc: "Make sure the dentist is properly qualified and registered, with clear clinical standards.",
  },
  {
    title: "Location",
    desc: "A conveniently located clinic makes routine check-ups and follow-up visits easier and more consistent.",
  },
  {
    title: "Services Offered",
    desc: "Ensure that the dental clinic offers the range of preventative and restorative care your family needs.",
  },
  {
    title: "Insurance",
    desc: "Check if the dental practice supports your insurance plan and provides clear upfront fee guidance.",
  },
];

export function GeneralDentistryChoosing() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Patient guide
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                How to choose a{" "}
                <span className="text-[#754B3D]">general dentist</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Finding the right dentist matters for your long-term oral health. Consider these
                four essentials when choosing a practice.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CHOOSING_FACTORS.map((factor, i) => (
                <Reveal key={factor.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-black/6 bg-white p-6">
                    <span className="font-mono text-xs font-medium text-[#754B3D]">0{i + 1}</span>
                    <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                      {factor.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">{factor.desc}</p>
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
