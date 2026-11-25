import { Section } from "@/components/hims";

const REASONS = [
  {
    title: "Worldwide Reach",
    desc: "No matter your location, our grillz are just a scan away.",
  },
  {
    title: "Expert Craftsmanship",
    desc: "With attention to detail and quality, we create pieces that are as unique as you.",
  },
  {
    title: "Personalized Experience",
    desc: "From design to delivery, your preferences are our priority.",
  },
  {
    title: "Peace of Mind",
    desc: "Our 1-year guarantee means your investment is protected.",
  },
] as const;

export function GrillzProcess() {
  return (
    <Section
      id="why-pav"
      theme="ink"
      className="bg-[#120d08]"
      aria-labelledby="grillz-why-pav-heading"
    >
      <p className="font-mono text-[13px] tracking-wide text-[#ffc671] uppercase">
        Clinical Craftsmanship
      </p>
      <h2
        id="grillz-why-pav-heading"
        className="mt-3 max-w-3xl text-[clamp(34px,4.4vw,60px)] leading-[1.04] font-normal tracking-[-0.03em]"
      >
        Why Choose <span className="text-[#ffc671]">Pav Dental Grillz?</span>
      </h2>
      <ul className="mt-12 grid list-none gap-px overflow-hidden rounded-[24px] bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((item, i) => (
          <li key={item.title} className="bg-[#1b140d] p-7">
            <span className="font-mono text-[13px] text-[#ffc671]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-6 text-[22px] leading-[1.15] font-normal">{`${item.title}:`}</p>
            <p className="mt-3 text-[15px] leading-[1.5] text-white/70">{item.desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
