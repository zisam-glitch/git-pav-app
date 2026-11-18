import { Reveal } from "@/components/home/reveal";

const IMPORTANCE_POINTS = [
  {
    title: "Early Diagnosis",
    desc: "Regular dental visits help in early detection of oral health problems like cavities and gum disease.",
  },
  {
    title: "Prevention",
    desc: "General dentistry focuses on preventative care, which can save you from more extensive and expensive treatments down the line.",
  },
  {
    title: "Education",
    desc: "Dentists not only treat but also educate patients on the best practices for oral care.",
  },
  {
    title: "Family Care",
    desc: "General dentistry caters to the dental needs of the entire family, from children to seniors.",
  },
];

export function GeneralDentistryImportance() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Preventative foundation
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Why general dentistry{" "}
            <span className="text-[#754B3D]">is important</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            General dentistry forms the foundation of good oral health, preventing problems early
            and supporting healthy smiles for life.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPORTANCE_POINTS.map((point, i) => (
            <Reveal key={point.title} delay={0.04 * i} className="h-full">
              <div
                className={`${
                  i % 2 === 0 ? "hims-tile-warm" : "hims-tile-sage"
                } flex h-full flex-col rounded-[1.5rem] border border-black/6 p-6`}
              >
                <span className="font-mono text-xs font-medium text-[#754B3D]">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{point.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
