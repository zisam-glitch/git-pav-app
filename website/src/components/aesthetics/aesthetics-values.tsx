import { Reveal } from "@/components/home/reveal";

const VALUES = [
  {
    title: "Wholehearted Commitment",
    desc: "Our motivation stems from a genuine desire to provide the best care, rather than being driven by sales incentives.",
  },
  {
    title: "Expert Guidance",
    desc: "We take immense pride in delivering expert advice and guidance to our valued clients.",
  },
  {
    title: "Quality Assurance",
    desc: "Our unwavering commitment lies in using the utmost quality products, with no room for compromise.",
  },
];

export function AestheticsValues() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Our values
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Care led by{" "}
                <span className="text-[#754B3D]">clinical ethics</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                We operate with the integrity of healthcare professionals rather than the sales
                pressure of beauty salons.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-black/6 bg-white p-7">
                    <span className="font-mono text-xs font-medium text-[#754B3D]">0{i + 1}</span>
                    <h3 className="mt-3 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      {v.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">{v.desc}</p>
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
