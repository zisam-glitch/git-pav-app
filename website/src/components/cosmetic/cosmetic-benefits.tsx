import { Reveal } from "@/components/home/reveal";

const BENEFITS = [
  {
    title: "Enhanced Appearance",
    desc: "The most obvious benefit is a more attractive, balanced smile tailored to your natural features.",
  },
  {
    title: "Boosted Confidence",
    desc: "A better smile often leads to increased self-esteem and confidence in work and social settings.",
  },
  {
    title: "Improved Oral Health",
    desc: "Some procedures help improve your oral health by aligning surfaces and making cleaning easier.",
  },
  {
    title: "Long-Lasting Results",
    desc: "Many cosmetic dentistry procedures offer long-term or permanent solutions when properly cared for.",
  },
  {
    title: "Wider Range of Options",
    desc: "There are treatments available for almost every aesthetic issue you might have with your teeth.",
  },
];

export function CosmeticBenefits() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Why patients choose it
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Benefits of{" "}
                <span className="text-[#754B3D]">cosmetic dentistry</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Thoughtful aesthetic care improves how your smile looks, feels, and cleans day to
                day.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-black/6 bg-white p-6">
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
