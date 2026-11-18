import { Reveal } from "@/components/home/reveal";

const REASONS = [
  {
    title: "Worldwide Reach",
    desc: "No matter your location, our grillz are just a scan away with worldwide delivery straight to your doorstep.",
  },
  {
    title: "Expert Craftsmanship",
    desc: "With clinical attention to detail and quality, we create pieces that fit flawlessly without harming enamel.",
  },
  {
    title: "Personalized Experience",
    desc: "From metal selection and stone placement to final polish and delivery, your preferences lead every step.",
  },
  {
    title: "1-Year Guarantee",
    desc: "We stand by our craftsmanship. All our grillz come with a 1-year guarantee for complete peace of mind.",
  },
];

export function GrillzProcess() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Why choose Pav Dental Grillz?
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                A dazzling smile,{" "}
                <span className="text-[#ECD880]">just a click away</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Combining clinical dental safety with master goldsmith craftsmanship — backed by our
                one-year guarantee and worldwide delivery.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REASONS.map((b, i) => (
                <Reveal key={b.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-white/12 bg-white/6 p-6">
                    <span className="font-mono text-xs font-medium text-[#ECD880]">0{i + 1}</span>
                    <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-white">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">{b.desc}</p>
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
