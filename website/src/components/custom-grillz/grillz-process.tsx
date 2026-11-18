const BENEFITS = [
  {
    title: "Dentist-Fitted Safety",
    desc: "Clinical dental impressions ensure a perfect fit that protects your natural teeth and enamel with zero bite interference.",
  },
  {
    title: "100% Solid Gold",
    desc: "No plating, no hollow cores. Choose from 10k, 14k, or 18k yellow, white, or rose gold for genuine luxury and durability.",
  },
  {
    title: "VVS Natural Diamonds",
    desc: "Hand-set conflict-free VVS1-VVS2 clarity diamonds by master jewelers for maximum brilliance and secure stone retention.",
  },
  {
    title: "Removable & Comfortable",
    desc: "Snap-fit design allows easy removal for eating, brushing, and sleeping while maintaining secure retention when worn.",
  },
];

export function GrillzProcess() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Benefits of Custom Grillz
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            A transformative investment in your personal style, combining clinical safety with master goldsmith craftsmanship.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8  ">
          {BENEFITS.map((b, i) => (
            <div key={b.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b5848] leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
