import { Reveal } from "@/components/home/reveal";

const INDICATORS = [
  {
    title: "Bleeding Gums",
    desc: "Gums that bleed during brushing or flossing are an early sign of gum inflammation.",
  },
  {
    title: "Bad Breath",
    desc: "Persistent bad breath often links to trapped plaque, hardened tartar, or gum pockets.",
  },
  {
    title: "Gum Swelling or Tenderness",
    desc: "Red, puffy, or tender gums benefit from gentle professional cleaning around the gumline.",
  },
  {
    title: "Stains on Teeth",
    desc: "Surface staining from tea, coffee, or smoking can be lifted with a professional polish.",
  },
  {
    title: "Loose Teeth",
    desc: "Teeth that feel loose or shifting require prompt assessment of supporting gum and bone health.",
  },
  {
    title: "Sensitive Gums",
    desc: "Topical anaesthesia can be used during hygiene treatment if your gums feel delicate.",
  },
  {
    title: "Diabetes or Healing Conditions",
    desc: "Medical conditions affecting healing make regular preventative gum care especially important.",
  },
  {
    title: "Braces, Crowns & Implants",
    desc: "Essential maintenance if you wear braces, dentures, crowns, veneers, bridges, or implants.",
  },
];

export function OralHygieneWhoNeeds() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Signs to watch for
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Who needs{" "}
            <span className="text-[#754B3D]">hygiene treatment?</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            You may need to see our hygienist if you notice any of these signs, or if you wear
            braces, dentures, crowns, veneers, bridges, or implants.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDICATORS.map((item, i) => (
            <Reveal key={item.title} delay={0.03 * i} className="h-full">
              <div
                className={`${
                  i % 2 === 0 ? "hims-tile-warm" : "hims-tile-sage"
                } flex h-full flex-col rounded-[1.5rem] border border-black/6 p-6`}
              >
                <span className="font-mono text-xs font-medium text-[#754B3D]">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
